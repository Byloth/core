import { ValueException } from "../exceptions/index.js";
import { SmartIterator } from "../iterators/index.js";
import type { GeneratorFunction } from "../iterators/types.js";

import AggregatedIterator from "./aggregated-iterator.js";
import type { KeyedIteratee, KeyedReducer, KeyedTypeGuardPredicate } from "./types.js";

/**
 * A class representing an aggregated iterator that has been reduced in a lazy and optimized way.
 *
 * It's part of the {@link AggregatedIterator} and {@link AggregatedAsyncIterator} implementations,
 * providing a way to reduce them into a single value or another aggregated iterable.  
 * For this reason, it isn't recommended to instantiate this class directly
 * (although it's still possible), but rather use the reducing methods provided by the aggregated iterators.
 *
 * It isn't directly iterable, just like its parent class, and needs to specify on what you want to iterate.  
 * See the {@link ReducedIterator.keys}, {@link ReducedIterator.entries}
 * & {@link ReducedIterator.values} methods.  
 * It does, however, provide the same set of methods to perform
 * operations and transformation on the elements of the iterator,  
 * having also the knowledge and context of the groups to which
 * they belong, allowing to handle them in a grouped manner.
 *
 * This is particularly useful when you have group elements and
 * need perform specific operations on the reduced elements.
 *
 * ---
 *
 * @example
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
 * @template K The type of the key used to group the elements.
 * @template T The type of the elements in the iterator.
 */
export default class ReducedIterator<K extends PropertyKey, T>
{
    /**
     * The internal {@link SmartIterator} object that holds the reduced elements.
     */
    protected readonly _elements: SmartIterator<[K, T]>;

    /**
     * Initializes a new instance of the {@link ReducedIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new ReducedIterator<string, number>([["A", 1], ["B", 2], ["C", 4]]);
     * ```
     *
     * ---
     *
     * @param iterable A reduced iterable object.
     */
    public constructor(iterable: Iterable<[K, T]>);

    /**
     * Initializes a new instance of the {@link ReducedIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new ReducedIterator<string, number>({
     *     _index: 0,
     *     next: () =>
     *     {
     *         if (this._index >= 3) { return { done: true, value: undefined }; }
     *         this._index += 1;
     *
     *         return { done: false, value: [["A", "B", "C"][this._index], (this._index + 1)] };
     *     }
     * });
     * ```
     *
     * ---
     *
     * @param iterator An reduced iterator object.
     */
    public constructor(iterator: Iterator<[K, T]>);

    /**
     * Initializes a new instance of the {@link ReducedIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * import { range, Random } from "@byloth/core";
     *
     * const results = new ReducedIterator<string, number>(function* ()
     * {
     *     for (const index of range(3))
     *     {
     *         yield [["A", "B", "C"][index], (index + 1)];
     *     }
     * });
     * ```
     *
     * ---
     *
     * @param generatorFn A generator function that produces the reduced elements.
     */
    public constructor(generatorFn: GeneratorFunction<[K, T]>);

    /**
     * Initializes a new instance of the {@link ReducedIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new ReducedIterator(reducedValues);
     * ```
     *
     * ---
     *
     * @param argument An iterable, iterator or generator function that produces the reduced elements.
     */
    public constructor(argument: Iterable<[K, T]> | Iterator<[K, T]> | GeneratorFunction<[K, T]>);
    public constructor(argument: Iterable<[K, T]> | Iterator<[K, T]> | GeneratorFunction<[K, T]>)
    {
        this._elements = new SmartIterator(argument);
    }

    /**
     * Determines whether all elements of the reduced iterator satisfy the given condition.
     * See also {@link ReducedIterator.some}.
     *
     * This method will iterate over all the elements of the iterator checking if they satisfy the condition.  
     * Once a single element doesn't satisfy the condition, the method will return `false` immediately.
     *
     * This may lead to an unknown final state of the iterator, which may be entirely or partially consumed.  
     * For this reason, it's recommended to consider it as consumed in any case and to not use it anymore.  
     * Consider using {@link ReducedIterator.find} instead.
     *
     * If the iterator is infinite and every element satisfies the condition, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .every((key, value) => value > 0);
     *
     * console.log(results); // true
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns `true` if all elements satisfy the condition, `false` otherwise.
     */
    public every(predicate: KeyedIteratee<K, T, boolean>): boolean
    {
        for (const [index, [key, element]] of this._elements.enumerate())
        {
            if (!(predicate(key, element, index))) { return false; }
        }

        return true;
    }

    /**
     * Determines whether any element of the reduced iterator satisfies the given condition.
     * See also {@link ReducedIterator.every}.
     *
     * This method will iterate over all the elements of the iterator checking if they satisfy the condition.  
     * Once a single element satisfies the condition, the method will return `true` immediately.
     *
     * This may lead to an unknown final state of the iterator, which may be entirely or partially consumed.  
     * For this reason, it's recommended to consider it as consumed in any case and to not use it anymore.  
     * Consider using {@link ReducedIterator.find} instead.
     *
     * If the iterator is infinite and no element satisfies the condition, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .some((key, value) => value > 0);
     *
     * console.log(results); // true
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns `true` if any element satisfies the condition, `false` otherwise.
     */
    public some(predicate: KeyedIteratee<K, T, boolean>): boolean
    {
        for (const [index, [key, element]] of this._elements.enumerate())
        {
            if (predicate(key, element, index)) { return true; }
        }

        return false;
    }

    /**
     * Filters the elements of the reduced iterator using a given condition.
     *
     * This method will iterate over all the elements of the iterator checking if they satisfy the condition.  
     * If the condition is met, the element will be included in the new iterator.
     *
     * Since the iterator is lazy, the filtering process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .filter((key, value) => value > 0);
     *
     * console.log(results.toObject()); // { odd: 4, even: 16 }
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing only the elements that satisfy the condition.
     */
    public filter(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, T>;

    /**
     * Filters the elements of the reduced iterator using a given type guard predicate.
     *
     * This method will iterate over all the elements of the iterator checking if they satisfy the condition.  
     * If the condition is met, the element will be included in the new iterator.
     *
     * Since the iterator is lazy, the filtering process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number | string>([-3, -1, "0", "2", 3, 5, "6", "8"])
     *     .groupBy((value) => Number(value) % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .filter<number>((key, value) => typeof value === "number");
     *
     * console.log(results.toObject()); // { odd: 4 }
     * ```
     *
     * ---
     *
     * @template S
     * The type of the elements that satisfy the condition.  
     * This allows the type-system to infer the correct type of the iterator.
     *
     * It must be a subtype of the original type of the elements.
     *
     * @param predicate The type guard condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing only the elements that satisfy the condition.
     */
    public filter<S extends T>(predicate: KeyedTypeGuardPredicate<K, T, S>): ReducedIterator<K, S>;
    public filter(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, T>
    {
        const elements = this._elements.enumerate();

        return new ReducedIterator(function* ()
        {
            for (const [index, [key, element]] of elements)
            {
                if (predicate(key, element, index)) { yield [key, element]; }
            }
        });
    }

    /**
     * Maps the elements of the reduced iterator using a given transformation function.
     *
     * This method will iterate over all the elements of the iterator applying the transformation function.  
     * The result of the transformation will be included in the new iterator.
     *
     * Since the iterator is lazy, the mapping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .map((key, value) => value * 2);
     *
     * console.log(results.toObject()); // { odd: 8, even: 32 }
     * ```
     *
     * ---
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the transformed elements.
     */
    public map<V>(iteratee: KeyedIteratee<K, T, V>): ReducedIterator<K, V>
    {
        const elements = this._elements.enumerate();

        return new ReducedIterator(function* ()
        {
            for (const [index, [key, element]] of elements)
            {
                yield [key, iteratee(key, element, index)];
            }
        });
    }

    /**
     * Reduces the elements of the reduced iterator using a given reducer function.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all the elements of the iterator applying the reducer function.  
     * The result of each iteration will be passed as the accumulator to the next one.
     *
     * The first accumulator value will be the first element of the iterator.  
     * The last accumulator value will be the final result of the reduction.
     *
     * Also note that:
     * - If an empty iterator is provided, a {@link ValueException} will be thrown.
     * - If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const result = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .reduce((key, accumulator, value) => accumulator + value);
     *
     * console.log(result); // 20
     * ```
     *
     * ---
     *
     * @param reducer The reducer function to apply to the elements of the iterator.
     *
     * @returns The final value after reducing all the elements of the iterator.
     */
    public reduce(reducer: KeyedReducer<K, T, T>): T;

    /**
     * Reduces the elements of the reduced iterator using a given reducer function.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all the elements of the iterator applying the reducer function.  
     * The result of each iteration will be passed as the accumulator to the next one.
     *
     * The first accumulator value will be the provided initial value.  
     * The last accumulator value will be the final result of the reduction.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const result = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .reduce((key, { value }, currentValue) => ({ value: value + currentValue }), { value: 0 });
     *
     * console.log(result); // { value: 20 }
     * ```
     *
     * ---
     *
     * @template A The type of the accumulator value which will also be the type of the final result of the reduction.
     *
     * @param reducer The reducer function to apply to the elements of the iterator.
     * @param initialValue The initial value of the accumulator.
     *
     * @returns The final result of the reduction.
     */
    public reduce<A>(reducer: KeyedReducer<K, T, A>, initialValue: A): A;
    public reduce<A>(reducer: KeyedReducer<K, T, A>, initialValue?: A): A
    {
        let index = 0;
        let accumulator = initialValue;
        if (accumulator === undefined)
        {
            const result = this._elements.next();
            if (result.done) { throw new ValueException("Cannot reduce an empty iterator without an initial value."); }

            accumulator = (result.value[1] as unknown) as A;
            index += 1;
        }

        for (const [key, element] of this._elements)
        {
            accumulator = reducer(key, accumulator, element, index);

            index += 1;
        }

        return accumulator;
    }

    /**
     * Flattens the elements of the reduced iterator using a given transformation function.
     *
     * This method will iterate over all the elements of the iterator applying the transformation function.  
     * The result of each transformation will be flattened into the new iterator.
     *
     * Since the iterator is lazy, the flattening process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator.concat([value]), () => [])
     *     .flatMap((key, value) => value);
     *
     * console.log(results.toObject()); // { odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} containing the flattened elements.
     */
    public flatMap<V>(iteratee: KeyedIteratee<K, T, V | readonly V[]>): AggregatedIterator<K, V>
    {
        const elements = this._elements.enumerate();

        return new AggregatedIterator(function* ()
        {
            for (const [index, [key, element]] of elements)
            {
                const values = iteratee(key, element, index);

                if (values instanceof Array)
                {
                    for (const value of values) { yield [key, value]; }
                }
                else { yield [key, values]; }
            }
        });
    }

    /**
     * Drops a given number of elements at the beginning of the reduced iterator.  
     * The remaining elements will be included in the new iterator.
     * See also {@link ReducedIterator.take}.
     *
     * Since the iterator is lazy, the dropping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * Only the dropped elements will be consumed in the process.  
     * The rest of the iterator will be consumed once the new iterator is.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator.concat(value), () => [])
     *     .drop(1);
     *
     * console.log(results.toObject()); // { even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @param count The number of elements to drop.
     *
     * @returns A new {@link ReducedIterator} containing the remaining elements.
     */
    public drop(count: number): ReducedIterator<K, T>
    {
        const elements = this._elements.enumerate();

        return new ReducedIterator(function* ()
        {
            for (const [index, [key, element]] of elements)
            {
                if (index >= count) { yield [key, element]; }
            }
        });
    }

    /**
     * Takes a given number of elements at the beginning of the reduced iterator.  
     * The elements will be included in the new iterator.
     * See also {@link ReducedIterator.drop}.
     *
     * Since the iterator is lazy, the taking process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * Only the taken elements will be consumed from the original reduced iterator.  
     * The rest of the original reduced iterator will be available for further consumption.
     *
     * ---
     *
     * @example
     * ```ts
     * const reduced = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator.concat(value), () => []);
     *
     * const results = iterator.take(1);
     *
     * console.log(results.toObject()); // { odd: [-3, -1, 3, 5] }
     * console.log(reduced.toObject()); // { even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @param limit The number of elements to take.
     *
     * @returns A new {@link ReducedIterator} containing the taken elements.
     */
    public take(limit: number): ReducedIterator<K, T>
    {
        const elements = this._elements.enumerate();

        return new ReducedIterator(function* ()
        {
            for (const [index, [key, element]] of elements)
            {
                if (index >= limit) { break; }
                yield [key, element];
            }
        });
    }

    /**
     * Finds the first element of the reduced iterator that satisfies the given condition.
     *
     * This method will iterate over all the elements of the iterator checking if they satisfy the condition.  
     * The first element that satisfies the condition will be returned immediately.
     *
     * Only the elements that are necessary to find the first
     * satisfying one will be consumed from the original iterator.  
     * The rest of the iterator will be available for further consumption.
     *
     * Also note that:
     * - If no element satisfies the condition, `undefined` will be returned once the entire iterator is consumed.
     * - If the iterator is infinite and no element satisfies the condition, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -3, -1, 0, 1, 2, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .find((key, value) => value > 0);
     *
     * console.log(results); // 16
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns The first element that satisfies the condition, `undefined` otherwise.
     */
    public find(predicate: KeyedIteratee<K, T, boolean>): T | undefined;

    /**
     * Finds the first element of the reduced iterator that satisfies the given type guard predicate.
     *
     * This method will iterate over all the elements of the iterator checking if they satisfy the condition.  
     * The first element that satisfies the condition will be returned immediately.
     *
     * Only the elements that are necessary to find the first
     * satisfying one will be consumed from the original iterator.  
     * The rest of the iterator will be available for further consumption.
     *
     * Also note that:
     * - If no element satisfies the condition, `undefined` will be returned once the entire iterator is consumed.
     * - If the iterator is infinite and no element satisfies the condition, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number | string>(["-3", -3, "-1", 0, 1, 2, "5", 6, 8])
     *     .groupBy((value) => Number(value) % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .find<number>((key, value) => typeof value === "number");
     *
     * console.log(results); // 16
     * ```
     *
     * ---
     *
     * @template S
     * The type of the elements that satisfy the condition.  
     * This allows the type-system to infer the correct type of the result.
     *
     * It must be a subtype of the original type of the elements.
     *
     * @param predicate The type guard condition to check for each element of the iterator.
     *
     * @returns The first element that satisfies the condition, `undefined` otherwise.
     */
    public find<S extends T>(predicate: KeyedTypeGuardPredicate<K, T, S>): S | undefined;
    public find(predicate: KeyedIteratee<K, T, boolean>): T | undefined
    {
        for (const [index, [key, element]] of this._elements.enumerate())
        {
            if (predicate(key, element, index)) { return element; }
        }

        return undefined;
    }

    /**
     * Enumerates the elements of the reduced iterator.  
     * Each element is paired with its index in a new iterator.
     *
     * Since the iterator is lazy, the enumeration process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new ReducedIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .enumerate();
     *
     * console.log(results.toObject()); // [[0, 4], [1, 16]]
     * ```
     *
     * ---
     *
     * @returns A new {@link ReducedIterator} object containing the enumerated elements.
     */
    public enumerate(): ReducedIterator<K, [number, T]>
    {
        return this.map((_, element, index) => [index, element]);
    }

    /**
     * Removes all duplicate elements from the reduced iterator.  
     * The first occurrence of each element will be kept.
     *
     * Since the iterator is lazy, the deduplication process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new ReducedIterator<number>([-3, -1, 0, 2, 3, 6, -3, -1, 1, 5, 6, 8, 7, 2])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .map((key, value) => Math.abs(value))
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .unique();
     *
     * console.log(results.toObject()); // { odd: 24 }
     *
     * @returns A new {@link ReducedIterator} containing only the unique elements.
     */
    public unique(): ReducedIterator<K, T>
    {
        const elements = this._elements;

        return new ReducedIterator(function* ()
        {
            const values = new Set<T>();
            for (const [key, element] of elements)
            {
                if (values.has(element)) { continue; }
                values.add(element);

                yield [key, element];
            }
        });
    }

    /**
     * Counts the number of elements in the reduced iterator.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .count();
     *
     * console.log(results); // 2
     * ```
     *
     * ---
     *
     * @returns The number of elements in the iterator.
     */
    public count(): number
    {
        let index = 0;

        for (const _ of this._elements) { index += 1; }

        return index;
    }

    /**
     * Iterates over all elements of the reduced iterator.  
     * The elements are passed to the function along with their key and index.
     *
     * This method will consume the entire iterator in the process.  
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const reduced = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value);
     *
     * reduced.forEach((key, value, index) =>
     * {
     *     console.log(`#${index} - ${key}: ${value}`); // "#0 - odd: 4", "#1 - even: 16"
     * });
     * ```
     *
     * ---
     *
     * @param iteratee The function to apply to each element of the reduced iterator.
     */
    public forEach(iteratee: KeyedIteratee<K, T>): void
    {
        for (const [index, [key, element]] of this._elements.enumerate())
        {
            iteratee(key, element, index);
        }
    }

    /**
     * Reaggregates the elements of the reduced iterator.  
     * The elements are grouped by a new key computed by the given iteratee function.
     *
     * Since the iterator is lazy, the reorganizing process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ---
     *
     * @example
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, -6, -8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .reorganizeBy((key, value) => value > 0 ? "positive" : "negative");
     *
     * console.log(results.toObject()); // { positive: 4, negative: -12 }
     * ```
     *
     * ---
     *
     * @template J The type of the new keys used to group the elements.
     *
     * @param iteratee The function to determine the new key of each element of the iterator.
     *
     * @returns A new {@link AggregatedIterator} containing the elements reorganized by the new keys.
     */
    public reorganizeBy<J extends PropertyKey>(iteratee: KeyedIteratee<K, T, J>): AggregatedIterator<J, T>
    {
        const elements = this._elements.enumerate();

        return new AggregatedIterator(function* ()
        {
            for (const [index, [key, element]] of elements)
            {
                yield [iteratee(key, element, index), element];
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
     * ---
     *
     * @example
     * ```ts
     * const keys = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .keys();
     *
     * console.log(keys.toArray()); // ["odd", "even"]
     * ```
     *
     * ---
     *
     * @returns A new {@link SmartIterator} containing all the keys of the iterator.
     */
    public keys(): SmartIterator<K>
    {
        const elements = this._elements;

        return new SmartIterator<K>(function* ()
        {
            for (const [key] of elements)
            {
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
     * ---
     *
     * @example
     * ```ts
     * const entries = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .entries();
     *
     * console.log(entries.toArray()); // [["odd", 4], ["even", 16]]
     * ```
     *
     * ---
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
     * ---
     *
     * @example
     * ```ts
     * const values = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value)
     *     .values();
     *
     * console.log(values.toArray()); // [4, 16]
     * ```
     *
     * ---
     *
     * @returns A new {@link SmartIterator} containing all the values of the iterator.
     */
    public values(): SmartIterator<T>
    {
        const elements = this._elements;

        return new SmartIterator<T>(function* ()
        {
            for (const [_, element] of elements)
            {
                yield element;
            }
        });
    }

    /**
     * Materializes the iterator into an array.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const reduced = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value);
     *
     * console.log(reduced.toArray()); // [4, 16]
     * ```
     *
     * ---
     *
     * @returns The {@link Array} containing all elements of the iterator.
     */
    public toArray(): T[]
    {
        return Array.from(this.values());
    }

    /**
     * Materializes the iterator into a map.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const reduced = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value);
     *
     * console.log(reduced.toMap()); // Map(2) { "odd" => 4, "even" => 16 }
     * ```
     *
     * ---
     *
     * @returns The {@link Map} containing all elements of the iterator.
     */
    public toMap(): Map<K, T>
    {
        return new Map(this.entries());
    }

    /**
     * Materializes the iterator into an object.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const reduced = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator + value);
     *
     * console.log(reduced.toObject()); // { odd: 4, even: 16 }
     * ```
     *
     * ---
     *
     * @returns The {@link Object} containing all elements of the iterator.
     */
    public toObject(): Record<K, T>
    {
        return Object.fromEntries(this.entries()) as Record<K, T>;
    }

    public readonly [Symbol.toStringTag]: string = "ReducedIterator";
}
