import ReducedIterator from "./reduced-iterator.js";
import SmartIterator from "../smart-iterator.js";

import type { KeyIteratee, KeyReducer } from "./types.js";
import type { GeneratorFunction } from "../../types.js";

export default class AggregateIterator<T, K extends PropertyKey>
{
    protected _elements: SmartIterator<[K, T]>;

    public constructor(generatorFn: GeneratorFunction<[K, T]>)
    {
        this._elements = new SmartIterator(generatorFn);
    }

    public filter(predicate: KeyIteratee<T, K, boolean>): AggregateIterator<T, K>
    {
        const elements = this._elements;

        return new AggregateIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                if (predicate(key, element, index))
                {
                    indexes.set(key, index + 1);

                    yield [key, element];
                }
            }
        });
    }
    public map<V>(iteratee: KeyIteratee<T, K, V>): AggregateIterator<V, K>
    {
        const elements = this._elements;

        return new AggregateIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                indexes.set(key, index + 1);

                yield [key, iteratee(key, element, index)];
            }
        });
    }
    public reduce<A>(reducer: KeyReducer<T, K, A>, initialValue?: A): ReducedIterator<A, K>
    {
        const accumulators = new Map<K, [number, A]>();

        for (const [key, element] of this._elements)
        {
            let index: number;
            let accumulator: A;

            if (accumulators.has(key)) { [index, accumulator] = accumulators.get(key)!; }
            else if (initialValue !== undefined) { [index, accumulator] = [0, initialValue]; }
            else
            {
                accumulators.set(key, [0, (element as unknown) as A]);

                continue;
            }

            index += 1;
            accumulator = reducer(key, accumulator, element, index);

            accumulators.set(key, [index, accumulator]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, accumulator]] of accumulators)
            {
                yield [key, accumulator];
            }
        });
    }

    public toArray(): T[][]
    {
        return Array.from(this.toMap().values());
    }
    public toMap(): Map<K, T[]>
    {
        const groups = new Map<K, T[]>();

        for (const [key, element] of this._elements)
        {
            const value = groups.get(key) ?? [];

            value.push(element);
            groups.set(key, value);
        }

        return groups;
    }
    public toObject(): Record<K, T[]>
    {
        const groups = { } as Record<K, T[]>;

        for (const [key, element] of this._elements)
        {
            const value = groups[key] ?? [];

            value.push(element);
            groups[key] = value;
        }

        return groups;
    }
}
