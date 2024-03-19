import ReducedIterator from "./reduced-iterator.js";
import SmartIterator from "../smart-iterator.js";

import type { KeyIteratee, KeyReducer } from "./types.js";
import type { GeneratorFunction } from "../../types.js";

export default class AggregatedIterator<T, K extends PropertyKey>
{
    protected _elements: SmartIterator<[K, T]>;

    public constructor(iterable: Iterable<[K, T]>);
    public constructor(iterator: Iterator<[K, T]>);
    public constructor(generatorFn: GeneratorFunction<[K, T]>);
    public constructor(argument: Iterable<[K, T]> | Iterator<[K, T]> | GeneratorFunction<[K, T]>);
    public constructor(argument: Iterable<[K, T]> | Iterator<[K, T]> | GeneratorFunction<[K, T]>)
    {
        this._elements = new SmartIterator(argument);
    }

    public every(predicate: KeyIteratee<T, K, boolean>): ReducedIterator<boolean, K>
    {
        const indexes = new Map<K, [number, boolean]>();

        for (const [key, element] of this._elements)
        {
            const [index, result] = indexes.get(key) ?? [0, true];

            if (!(result)) { continue; }

            indexes.set(key, [index + 1, predicate(key, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, result]] of indexes)
            {
                yield [key, result];
            }
        });
    }
    public some(predicate: KeyIteratee<T, K, boolean>): ReducedIterator<boolean, K>
    {
        const indexes = new Map<K, [number, boolean]>();

        for (const [key, element] of this._elements)
        {
            const [index, result] = indexes.get(key) ?? [0, false];

            if (result) { continue; }

            indexes.set(key, [index + 1, predicate(key, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, result]] of indexes)
            {
                yield [key, result];
            }
        });
    }

    public filter(predicate: KeyIteratee<T, K, boolean>): AggregatedIterator<T, K>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                indexes.set(key, index + 1);

                if (predicate(key, element, index)) { yield [key, element]; }
            }
        });
    }
    public map<V>(iteratee: KeyIteratee<T, K, V>): AggregatedIterator<V, K>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
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

            if (accumulators.has(key))
            {
                [index, accumulator] = accumulators.get(key)!;

                index += 1;
            }
            else if (initialValue !== undefined)
            {
                index = 0;
                accumulator = initialValue;
            }
            else
            {
                accumulators.set(key, [0, (element as unknown) as A]);

                continue;
            }

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

    public unique(): AggregatedIterator<T, K>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const keys = new Map<K, Set<T>>();

            for (const [key, element] of elements)
            {
                const values = keys.get(key) ?? new Set<T>();

                if (values.has(element)) { continue; }

                values.add(element);
                keys.set(key, values);

                yield [key, element];
            }
        });
    }

    public count(): ReducedIterator<number, K>
    {
        const counters = new Map<K, number>();

        for (const [key] of this._elements)
        {
            const count = counters.get(key) ?? 0;

            counters.set(key, count + 1);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, count] of counters)
            {
                yield [key, count];
            }
        });
    }
    public first(): ReducedIterator<T, K>
    {
        const firsts = new Map<K, T>();

        for (const [key, element] of this._elements)
        {
            if (firsts.has(key)) { continue; }

            firsts.set(key, element);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, element] of firsts)
            {
                yield [key, element];
            }
        });
    }
    public last(): ReducedIterator<T, K>
    {
        const lasts = new Map<K, T>();

        for (const [key, element] of this._elements)
        {
            lasts.set(key, element);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, element] of lasts)
            {
                yield [key, element];
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
