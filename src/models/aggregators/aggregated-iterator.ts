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
 * See the {@link AggregatedIterator.keys}, {@link AggregatedIterator.entries}
 * & {@link AggregatedIterator.values} methods.  
 * It does, however, provide the same set of methods to perform
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
 * @template K The type of the keys used to group the elements.
 * @template T The type of the elements to aggregate.
 */
export default class AggregatedIterator<K extends PropertyKey, T>
{
    /**
     * The internal {@link SmartIterator} object that holds the elements to aggregate.
     */
    protected _elements: SmartIterator<[K, T]>;

    /**
     * Initializes a new instance of the {@link AggregatedIterator} class.
     *
     * ```ts
     * const iterator = new AggregatedIterator<string, number>([["A", 1], ["B", 2], ["A", 3], ["C", 4], ["B", 5]]);
     * ```
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
     * const iterator = new AggregatedIterator<string, number>({
     *     _index: 0,
     *     next: () =>
     *     {
     *         if (this._index >= 5) { return { done: true, value: undefined }; }
     *         this._index += 1;
     *
     *         return { done: false, value: [Random.Choice(["A", "B", "C"]), (this._index + 1)] };
     *     }
     * });
     * ```
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
     * const iterator = new AggregatedIterator<string, number>(function* ()
     * {
     *     for (const index of range(5))
     *     {
     *         yield [Random.Choice(["A", "B", "C"]), (index + 1)];
     *     }
     * });
     * ```
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
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once a single element of one group doesn't satisfy the condition,
     * the result for the respective group will be `false`.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the boolean results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .every((key, value) => value >= 0);
     *
     * console.log(results.toObject()); // { odd: false, even: true }
     * ```
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the boolean results for each group.
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
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once a single element of one group satisfies the condition,
     * the result for the respective group will be `true`.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the boolean results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-5, -4, -3, -2, -1, 0])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .some((key, value) => value >= 0);
     *
     * console.log(results.toObject()); // { odd: false, even: true }
     * ```
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A {@link ReducedIterator} containing the boolean results for each group.
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
     * If the condition is met, the element will be included in the new iterator.
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
     *     .filter((key, value) => value >= 0);
     *
     * console.log(results.toObject()); // { odd: [3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} containing only the elements that satisfy the condition.
     */
    public filter(predicate: KeyedIteratee<K, T, boolean>): AggregatedIterator<K, T>;

    /**
     * Filters the elements of the iterator using a given condition.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * If the condition is met, the element will be included in the new iterator.
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
     *     .filter<number>((key, value) => typeof value === "number");
     *
     * console.log(results.toObject()); // { odd: [-3, 5], even: [0, 6] }
     * ```
     *
     * @template S
     * The type of the elements that satisfy the condition.  
     * This allows the type-system to infer the correct type of the new iterator.
     *
     * It must be a subtype of the original type of the elements.
     *
     * @param predicate The type guard condition to check for each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} containing only the elements that satisfy the condition.
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

    /**
     * Maps the elements of the iterator using a given transformation function.
     *
     * This method will iterate over all elements of the iterator applying the transformation function.  
     * The result of each transformation will be included in the new iterator.
     *
     * Since the iterator is lazy, the mapping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .map((key, value) => Math.abs(value));
     *
     * console.log(results.toObject()); // { odd: [3, 1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} containing the transformed elements.
     */
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

    /**
     * Reduces the elements of the iterator using a given reducer function.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator applying the reducer function.  
     * The result of each iteration will be passed as the accumulator to the next one.
     *
     * The first accumulator value will be the first element of the iterator.  
     * The last accumulator value will be the final result of the reduction.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the reduced results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value);
     *
     * console.log(results.toObject()); // { odd: 4, even: 16 }
     * ```
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the reduced results for each group.
     */
    public reduce(reducer: KeyedReducer<K, T, T>): ReducedIterator<K, T>;

    /**
     * Reduces the elements of the iterator using a given reducer function.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator applying the reducer function.  
     * The result of each iteration will be passed as the accumulator to the next one.
     *
     * The first accumulator value will be the provided initial value.  
     * The last accumulator value will be the final result of the reduction.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the reduced results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value, 0);
     *
     * console.log(results.toObject()); // { odd: 4, even: 16 }
     * ```
     *
     * @template A The type of the accumulator value which will also be the type of the final result of the reduction.
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     * @param initialValue The initial value of the accumulator.
     *
     * @returns A new {@link ReducedIterator} containing the reduced results for each group.
     */
    public reduce<A extends PropertyKey>(reducer: KeyedReducer<K, T, A>, initialValue: A): ReducedIterator<K, A>;

    /**
     * Reduces the elements of the iterator using a given reducer function.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator applying the reducer function.  
     * The result of each iteration will be passed as the accumulator to the next one.
     *
     * The first accumulator value will be the provided initial value by the given function.  
     * The last accumulator value will be the final result of the reduction.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the reduced results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, { value }, currentValue) => ({ value: value + currentValue }), (key) => ({ value: 0 }));
     *
     * console.log(results.toObject()); // { odd: { value: 4 }, even: { value: 16 } }
     * ```
     *
     * @template A The type of the accumulator value which will also be the type of the final result of the reduction.
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     * @param initialValue The function that provides the initial value for the accumulator.
     *
     * @returns A new {@link ReducedIterator} containing the reduced results for each group.
     */
    public reduce<A>(reducer: KeyedReducer<K, T, A>, initialValue: (key: K) => A): ReducedIterator<K, A>;
    public reduce<A>(reducer: KeyedReducer<K, T, A>, initialValue?: A | ((key: K) => A)): ReducedIterator<K, A>
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

                if (initialValue instanceof Function) { accumulator = initialValue(key); }
                else { accumulator = initialValue; }
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

    /**
     * Flattens the elements of the iterator using a given transformation function.
     *
     * This method will iterate over all elements of the iterator applying the transformation function.  
     * The result of each transformation will be included in the new iterator.
     *
     * Since the iterator is lazy, the flattening process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number[]>([[-3, -1], 0, 2, 3, 5, [6, 8]])
     *      .groupBy((values) =>
     *      {
     *          const value = values instanceof Array ? values[0] : values;
     *          return value % 2 === 0 ? "even" : "odd";
     *      })
     *     .flatMap((key, values) => values);
     *
     * console.log(results.toObject()); // { odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} containing the transformed elements.
     */
    public flatMap<V>(iteratee: KeyedIteratee<K, T, V | readonly V[]>): AggregatedIterator<K, V>
    {
        const elements = this._elements;

        return new AggregatedIterator(function* ()
        {
            const indexes = new Map<K, number>();
            for (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;
                const values = iteratee(key, element, index);

                if (values instanceof Array)
                {
                    for (const value of values) { yield [key, value]; }
                }
                else { yield [key, values]; }

                indexes.set(key, index + 1);
            }
        });
    }

    /**
     * Drops a given number of elements from the beginning of each group of the iterator.  
     * The remaining elements will be included in the new iterator.
     * See also {@link AggregatedIterator.take}.
     *
     * Since the iterator is lazy, the dropping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .drop(2);
     *
     * console.log(results.toObject()); // { odd: [3, 5], even: [6, 8] }
     * ```
     *
     * @param count The number of elements to drop from the beginning of each group.
     *
     * @returns A new {@link AggregatedIterator} containing the remaining elements.
     */
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

    /**
     * Takes a given number of elements from the beginning of each group of the iterator.  
     * The elements will be included in the new iterator.
     * See also {@link AggregatedIterator.drop}.
     *
     * Since the iterator is lazy, the taking process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .take(2);
     *
     * console.log(results.toObject()); // { odd: [-3, -1], even: [0, 2] }
     * ```
     *
     * @param limit The number of elements to take from the beginning of each group.
     *
     * @returns A new {@link AggregatedIterator} containing the taken elements.
     */
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

    /**
     * Finds the first element of each group of the iterator that satisfies a given condition.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once the first element of one group satisfies the condition,
     * the result for the respective group will be the element itself.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain the first element that satisfies the condition for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .find((key, value) => value > 0);
     *
     * console.log(results.toObject()); // { odd: 3, even: 2 }
     * ```
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the first element that satisfies the condition for each group.
     */
    public find(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, T | undefined>;

    /**
     * Finds the first element of each group of the iterator that satisfies a given condition.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once the first element of one group satisfies the condition,
     * the result for the respective group will be the element itself.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain the first element that satisfies the condition for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartIterator<number | string>([-3, "-1", 0, "2", "3", 5, 6, "8"])
     *     .groupBy((value) => Number(value) % 2 === 0 ? "even" : "odd")
     *     .find<number>((key, value) => typeof value === "number");
     *
     * console.log(results.toObject()); // { odd: -3, even: 0 }
     * ```
     *
     * @template S
     * The type of the elements that satisfy the condition.  
     * This allows the type-system to infer the correct type of the new iterator.
     *
     * It must be a subtype of the original type of the elements.
     *
     * @param predicate The type guard condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the first element that satisfies the condition for each group.
     */
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

    /**
     * Enumerates the elements of the iterator.  
     * Each element is paired with its index within the group in a new iterator.
     *
     * Since the iterator is lazy, the enumeration process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, 0, 2, -1, 3])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .enumerate();
     *
     * console.log(results.toObject()); // { odd: [[0, -3], [1, -1], [2, 3]], even: [[0, 0], [1, 2]] }
     * ```
     *
     * @returns A new {@link AggregatedIterator} containing the enumerated elements.
     */
    public enumerate(): AggregatedIterator<K, [number, T]>
    {
        return this.map((_, value, index) => [index, value]);
    }

    /**
     * Removes all duplicate elements from within each group of the iterator.  
     * The first occurrence of each element will be included in the new iterator.
     *
     * Since the iterator is lazy, the deduplication process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 6, -3, -1, 0, 5, 6, 8, 0, 2])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .unique();
     *
     * console.log(results.toObject()); // { odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * @returns A new {@link AggregatedIterator} containing only the unique elements.
     */
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

    /**
     * Counts the number of elements within each group of the iterator.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .count();
     *
     * console.log(results.toObject()); // { odd: 4, even: 4 }
     * ```
     *
     * @returns A new {@link ReducedIterator} containing the number of elements for each group.
     */
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

    /**
     * Iterates over the elements of the iterator.  
     * The elements are passed to the given iteratee function along with their key and index within the group.
     *
     * This method will consume the entire iterator in the process.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const aggregator = new SmartIterator<number>([-3, 0, 2, -1, 3])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd");
     *
     * aggregator.forEach((key, value, index) =>
     * {
     *     console.log(`${index}: ${value}`); // "0: -3", "0: 0", "1: 2", "1: -1", "2: 3"
     * };
     * ```
     *
     * @param iteratee The function to execute for each element of the iterator.
     */
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

    /**
     * Changes the key of each element on which the iterator is aggregated.  
     * The new key is determined by the given iteratee function.
     *
     * Since the iterator is lazy, the reorganization process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .map((key, value, index) => index % 2 === 0 ? value : -value)
     *     .reorganizeBy((key, value) => value >= 0 ? "+" : "-");
     *
     * console.log(results.toObject()); // { "+": [1, 0, 3, 6], "-": [-3, -2, -5, -8] }
     * ```
     *
     * @template J The type of the new key.
     *
     * @param iteratee The function to determine the new key for each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} containing the elements reorganized by the new keys.
     */
    public reorganizeBy<J extends PropertyKey>(iteratee: KeyedIteratee<K, T, J>): AggregatedIterator<J, T>
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

    /**
     * An utility method that returns a new {@link SmartIterator}
     * object containing all the keys of the iterator.
     *
     * Since the iterator is lazy, the keys will be extracted
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const keys = new SmartIterator([-3, Symbol(), "A", { }, null, [1 , 2, 3], false])
     *     .groupBy((value) => typeof value)
     *     .keys();
     *
     * console.log(keys.toArray()); // ["number", "symbol", "string", "object", "boolean"]
     * ```
     *
     * @returns A new {@link SmartIterator} containing all the keys of the iterator.
     */
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

    /**
     * An utility method that returns a new {@link SmartIterator}
     * object containing all the entries of the iterator.  
     * Each entry is a tuple containing the key and the element.
     *
     * Since the iterator is lazy, the entries will be extracted
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const entries = new SmartIterator<number>([-3, 0, 2, -1, 3])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .entries();
     *
     * console.log(entries.toArray()); // [["odd", -3], ["even", 0], ["even", 2], ["odd", -1], ["odd", 3]]
     * ```
     *
     * @returns A new {@link SmartIterator} containing all the entries of the iterator.
     */
    public entries(): SmartIterator<[K, T]>
    {
        return this._elements;
    }

    /**
     * An utility method that returns a new {@link SmartIterator}
     * object containing all the values of the iterator.
     *
     * Since the iterator is lazy, the values will be extracted
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const values = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .values();
     *
     * console.log(values.toArray()); // [-3, -1, 0, 2, 3, 5, 6, 8]
     * ```
     *
     * @returns A new {@link SmartIterator} containing all the values of the iterator.
     */
    public values(): SmartIterator<T>
    {
        const elements = this._elements;

        return new SmartIterator<T>(function* ()
        {
            for (const [_, element] of elements) { yield element; }
        });
    }

    /**
     * Materializes the iterator into an array of arrays.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const aggregator = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd");
     *
     * console.log(aggregator.toArray()); // [[-3, -1, 3, 5], [0, 2, 6, 8]]
     * ```
     *
     * @returns An {@link Array} of arrays containing the elements of the iterator.
     */
    public toArray(): T[][]
    {
        const map = this.toMap();

        return Array.from(map.values());
    }

    /**
     * Materializes the iterator into a map.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const aggregator = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd");
     *
     * console.log(aggregator.toMap()); // Map(2) { "odd" => [-3, -1, 3, 5], "even" => [0, 2, 6, 8] }
     * ```
     *
     * @returns A {@link Map} containing the elements of the iterator.
     */
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

    /**
     * Materializes the iterator into an object.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const aggregator = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd");
     *
     * console.log(aggregator.toObject()); // { odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * @returns An {@link Object} containing the elements of the iterator.
     */
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
