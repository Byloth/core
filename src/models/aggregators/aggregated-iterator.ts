import { SmartIterator } from "../iterators/index.js";
import type { GeneratorFunction, IteratorLike } from "../iterators/types.js";

import ReducedIterator from "./reduced-iterator.js";
import type { KeyedIteratee, KeyedTypeGuardPredicate, KeyedReducer } from "./types.js";

/**
 * A class representing an iterator that aggregates elements in a lazy and optimized way.
 *
 * It's part of the {@link SmartIterator} implementation, providing a way to group elements of an iterable by key.  
 * For this reason, it isn't recommended to instantiate this class directly
 * (although it's still possible), but rather use the {@link SmartIterator.groupBy} method.
 *
 * It isn't directly iterable like its parent class but rather needs to specify on what you want to iterate.  
 * See the {@link AggregatedIterator.keys}, {@link AggregatedIterator.items}
 * & {@link AggregatedIterator.values} methods.  
 * It does, however, provides the same set of methods to perform
 * operations and transformation on the elements of the iterator,  
 * having also the knowledge and context of the groups to which
 * they belong, allowing to handle them in a grouped manner.
 *
 * This is particularly useful when you need to group elements and
 * then perform specific operations on the groups themselves.
 *
 * ```ts
 * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
 *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
 *     .count();
 *
 * console.log(results.toObject()); // { odd: 4, even: 4 }
 * ```
 *
 * ---
 *
 * @template K The type of the keys of the elements.
 * @template T The type of the elements.
 */
export default class AggregatedIterator<K extends PropertyKey, T>
{
    /**
     * The internal {@link SmartIterator} that holds the elements to aggregate.
     */
    protected _elements: SmartIterator<[K, T]>;

    /**
     * Initializes a new instance of the {@link AggregatedIterator} class.
     *
     * ```ts
     * const iterator = new AggregatedIterator([["A", 1], ["B", 2], ["A", 3], ["C", 4], ["B", 5]]);
     * ```
     *
     * ---
     *
     * @param iterable The iterable to aggregate.
     */
    public constructor(iterable: Iterable<[K, T]>);

    /**
     * Initializes a new instance of the {@link AggregatedIterator} class.
     *
     * ```ts
     * import { Random } from "@byloth/core";
     *
     * const iterator = new AggregatedIterator({
     *     _index: 0,
     *     next: () =>
     *     {
     *         if (this._index >= 5) { return { done: true, value: undefined }; }
     *         this._index += 1;
     *
     *         return { done: false, value: [Random.Choice(["A", "B", "C"]), this._index] };
     *     }
     * });
     * ```
     *
     * ---
     *
     * @param iterator The iterator to aggregate.
     */
    public constructor(iterator: Iterator<[K, T]>);

    /**
     * Initializes a new instance of the {@link AggregatedIterator} class.
     *
     * ```ts
     * import { range, Random } from "@byloth/core";
     *
     * const iterator = new AggregatedIterator(function* ()
     * {
     *     for (const index of range(5))
     *     {
     *         yield [Random.Choice(["A", "B", "C"]), (index + 1)];
     *     }
     * });
     * ```
     *
     * ---
     *
     * @param generatorFn The generator function to aggregate.
     */
    public constructor(generatorFn: GeneratorFunction<[K, T]>);

    /**
     * Initializes a new instance of the {@link AggregatedIterator} class.
     *
     * ```ts
     * const iterator = new AggregatedIterator(keyedValues);
     * ```
     *
     * ---
     *
     * @param argument The iterable, iterator or generator function to aggregate.
     */
    public constructor(argument: IteratorLike<[K, T]> | GeneratorFunction<[K, T]>);
    public constructor(argument: IteratorLike<[K, T]> | GeneratorFunction<[K, T]>)
    {
        this._elements = new SmartIterator(argument);
    }

    /**
     * Determines whether all elements of each group of the iterator satisfy a given condition.  
     * See also {@link AggregatedIterator.some}.
     *
     * The method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once a single element of one group doesn't satisfy the condition,
     * the result for the respective group will set to `false`.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the boolean results for each group.  
     * If the iterator is infinite, the function will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .every((value) => value >= 0);
     *
     * console.log(results.toObject()); // { odd: false, even: true }
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns `true` if all elements satisfy the condition, `false` otherwise.
     */
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

    /**
     * Determines whether any elements of each group of the iterator satisfy a given condition.
     * See also {@link AggregatedIterator.every}.
     *
     * The method will iterate over all elements of the iterator checking if they satisfy the condition.
     * Once a single element of one group satisfies the condition,
     * the result for the respective group will set to `true`.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the boolean results for each group.
     * If the iterator is infinite, the function will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-5, -4, -3, -2, -1, 0])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .some((value) => value >= 0);
     *
     * console.log(results.toObject()); // { odd: false, even: true }
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A {@link ReducedIterator} object with the boolean results for each group.
     */
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

    /**
     * Filters the elements of the iterator using a given condition.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * If the condition is satisfied, the element will be included in the new iterator.
     *
     * Since the iterator is lazy, the filtering process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .filter((value) => value >= 0);
     *
     * console.log(results.toObject()); // { odd: [3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} with the elements that satisfy the condition.
     */
    public filter(predicate: KeyedIteratee<K, T, boolean>): AggregatedIterator<K, T>;

    /**
     * Filters the elements of the iterator using a given condition.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * If the condition is satisfied, the element will be included in the new iterator.
     *
     * Since the iterator is lazy, the filtering process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number | string>([-3, "-1", 0, "2", "3", 5, 6, "8"])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .filter<number>((value) => typeof value === "number");
     *
     * console.log(results.toObject()); // { odd: [-3, 5], even: [0, 6] }
     * ```
     *
     * ---
     *
     * @template S
     * The type of the elements that satisfy the condition.  
     * This allows the type-system to infer the correct type of the new iterator.
     *
     * It must be a subtype of the original type of the iterator.
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} with the elements that satisfy the condition.
     */
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

    public rekey<J extends PropertyKey>(iteratee: KeyedIteratee<K, T, J>): AggregatedIterator<J, T>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const indexes = new Map<K, number>();

            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                yield [iteratee(key, element, index), element];

                indexes.set(key, index + 1);
            }
        });
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
