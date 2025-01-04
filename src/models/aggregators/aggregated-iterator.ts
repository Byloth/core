import { SmartIterator } from "../iterators/index.js";
import type { GeneratorFunction, IteratorLike } from "../iterators/types.js";

import ReducedIterator from "./reduced-iterator.js";
import type { KeyedIteratee, KeyedTypeGuardPredicate, KeyedReducer } from "./types.js";

export default class AggregatedIterator<K extends PropertyKey, T>
{
    protected _elements: SmartIterator<[K, T]>;

    public constructor(iterable: Iterable<[K, T]>);
    public constructor(iterator: Iterator<[K, T]>);
    public constructor(generatorFn: GeneratorFunction<[K, T]>);
    public constructor(argument: IteratorLike<[K, T]> | GeneratorFunction<[K, T]>);
    public constructor(argument: IteratorLike<[K, T]> | GeneratorFunction<[K, T]>)
    {
        this._elements = new SmartIterator(argument);
    }

    public every(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, boolean>
    {
        const values = new Map<K, [number, boolean]>();

        for (const [key, element] of this._elements)
        {
            const [index, result] = values.get(key) ?? [0, true];

            if (!(result)) { continue; }

            values.set(key, [index + 1, predicate(key, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, result]] of values) { yield [key, result]; }
        });
    }
    public some(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, boolean>
    {
        const values = new Map<K, [number, boolean]>();

        for (const [key, element] of this._elements)
        {
            const [index, result] = values.get(key) ?? [0, false];

            if (result) { continue; }

            values.set(key, [index + 1, predicate(key, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, result]] of values) { yield [key, result]; }
        });
    }

    public filter(predicate: KeyedIteratee<K, T, boolean>): AggregatedIterator<K, T>;
    public filter<S extends T>(predicate: KeyedTypeGuardPredicate<K, T, S>): AggregatedIterator<K, S>;
    public filter(predicate: KeyedIteratee<K, T, boolean>): AggregatedIterator<K, T>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                if (predicate(key, element, index)) { yield [key, element]; }

                indexes.set(key, index + 1);
            }
        });
    }
    public map<V>(iteratee: KeyedIteratee<K, T, V>): AggregatedIterator<K, V>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                yield [key, iteratee(key, element, index)];

                indexes.set(key, index + 1);
            }
        });
    }
    public reduce(reducer: KeyedReducer<K, T, T>): ReducedIterator<K, T>;
    public reduce<A>(reducer: KeyedReducer<K, T, A>, initialValue: (key: K) => A): ReducedIterator<K, A>;
    public reduce<A>(reducer: KeyedReducer<K, T, A>, initialValue?: (key: K) => A): ReducedIterator<K, A>
    {
        const values = new Map<K, [number, A]>();

        for (const [key, element] of this._elements)
        {
            let index: number;
            let accumulator: A;

            if (values.has(key)) { [index, accumulator] = values.get(key)!; }
            else if (initialValue !== undefined)
            {
                index = 0;
                accumulator = initialValue(key);
            }
            else
            {
                values.set(key, [0, (element as unknown) as A]);

                continue;
            }

            values.set(key, [index + 1, reducer(key, accumulator, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, accumulator]] of values) { yield [key, accumulator]; }
        });
    }

    public flatMap<V>(iteratee: KeyedIteratee<K, T, Iterable<V>>): AggregatedIterator<K, V>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;
                const values = iteratee(key, element, index);

                for (const value of values) { yield [key, value]; }

                indexes.set(key, index + 1);
            }
        });
    }

    public drop(count: number): AggregatedIterator<K, T>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;
                if (index < count)
                {
                    indexes.set(key, index + 1);

                    continue;
                }

                yield [key, element];
            }
        });
    }
    public take(limit: number): AggregatedIterator<K, T>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;
                if (index >= limit) { continue; }

                yield [key, element];

                indexes.set(key, index + 1);
            }
        });
    }

    public find(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, T | undefined>;
    public find<S extends T>(predicate: KeyedTypeGuardPredicate<K, T, S>): ReducedIterator<K, S | undefined>;
    public find(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, T | undefined>
    {
        const values = new Map<K, [number, T | undefined]>();

        for (const [key, element] of this._elements)
        {
            let [index, finding] = values.get(key) ?? [0, undefined];

            if (finding !== undefined) { continue; }
            if (predicate(key, element, index)) { finding = element; }

            values.set(key, [index + 1, finding]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, finding]] of values) { yield [key, finding]; }
        });
    }

    public enumerate(): AggregatedIterator<K, [number, T]>
    {
        return this.map((_, value, index) => [index, value]);
    }
    public unique(): AggregatedIterator<K, T>
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

    public count(): ReducedIterator<K, number>
    {
        const counters = new Map<K, number>();

        for (const [key] of this._elements)
        {
            const count = counters.get(key) ?? 0;

            counters.set(key, count + 1);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, count] of counters) { yield [key, count]; }
        });
    }

    public forEach(iteratee: KeyedIteratee<K, T>): void
    {
        const indexes = new Map<K, number>();

        for (const [key, element] of this._elements)
        {
            const index = indexes.get(key) ?? 0;

            iteratee(key, element, index);

            indexes.set(key, index + 1);
        }
    }

    public keys(): SmartIterator<K>
    {
        const elements = this._elements;

        return new SmartIterator<K>(function* ()
        {
            const keys = new Set<K>();

            for (const [key] of elements)
            {
                if (keys.has(key)) { continue; }
                keys.add(key);

                yield key;
            }
        });
    }
    public items(): SmartIterator<[K, T]>
    {
        return this._elements;
    }
    public values(): SmartIterator<T>
    {
        const elements = this._elements;

        return new SmartIterator<T>(function* ()
        {
            for (const [_, element] of elements) { yield element; }
        });
    }

    public toArray(): T[][]
    {
        const map = this.toMap();

        return Array.from(map.values());
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

    public readonly [Symbol.toStringTag]: string = "AggregatedIterator";
}
