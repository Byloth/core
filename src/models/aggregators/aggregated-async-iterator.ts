import { SmartAsyncIterator } from "../iterators/index.js";
import type {
    GeneratorFunction,
    AsyncGeneratorFunction,
    MaybeAsyncGeneratorFunction,
    MaybeAsyncIteratorLike

} from "../iterators/types.js";
import type { MaybePromise } from "../types.js";

import ReducedIterator from "./reduced-iterator.js";
import type { MaybeAsyncKeyedIteratee, MaybeAsyncKeyedReducer } from "./types.js";

/**
 * A class representing an iterator that aggregates elements in a lazy and optimized way.
 *
 * It's part of the {@link SmartAsyncIterator} implementation,
 * providing a way to group elements of an iterable by key.  
 * For this reason, it isn't recommended to instantiate this class directly
 * (although it's still possible), but rather use the {@link SmartAsyncIterator.groupBy} method.
 *
 * It isn't directly iterable like its parent class but rather needs to specify on what you want to iterate.  
 * See the {@link AggregatedAsyncIterator.keys}, {@link AggregatedAsyncIterator.entries}
 * & {@link AggregatedAsyncIterator.values} methods.  
 * It does, however, provide the same set of methods to perform
 * operations and transformations on the elements of the iterator,
 * having also the knowledge and context of the groups to which
 * they belong, allowing to handle them in a grouped manner.
 *
 * This is particularly useful when you need to group elements and
 * then perform specific operations on the groups themselves.
 *
 * ```ts
 * const elements = fetch([...]); // Promise<[-3, -1, 0, 2, 3, 5, 6, 8]>;
 * const results = new SmartAsyncIterator(elements)
 *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
 *     .count();
 *
 * console.log(await results.toObject()); // { odd: 4, even: 4 }
 * ```
 *
 * ---
 *
 * @template K The type of the keys used to group the elements.
 * @template T The type of the elements to aggregate.
 */
export default class AggregatedAsyncIterator<K extends PropertyKey, T>
{
    /**
     * The internal {@link SmartAsyncIterator} object that holds the elements to aggregate.
     */
    protected _elements: SmartAsyncIterator<[K, T]>;

    /**
     * Initializes a new instance of the {@link AggregatedAsyncIterator} class.
     *
     * ```ts
     * const iterator = new AggregatedAsyncIterator([["A", 1], ["B", 2], ["A", 3], ["C", 4], ["B", 5]]);
     * ```
     *
     * ---
     *
     * @param iterable The iterable to aggregate.
     */
    public constructor(iterable: Iterable<[K, T]>);

    /**
     * Initializes a new instance of the {@link AggregatedAsyncIterator} class.
     *
     * ```ts
     * const elements = fetch([...]); // Promise<[["A", 1], ["B", 2], ["A", 3], ["C", 4], ["B", 5]]>
     * const iterator = new AggregatedAsyncIterator(elements);
     * ```
     *
     * ---
     *
     * @param iterable The iterable to aggregate.
     */
    public constructor(iterable: AsyncIterable<[K, T]>);

    /**
     * Initializes a new instance of the {@link AggregatedAsyncIterator} class.
     *
     * ```ts
     * import { Random } from "@byloth/core";
     *
     * const iterator = new AggregatedAsyncIterator({
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
     * Initializes a new instance of the {@link AggregatedAsyncIterator} class.
     *
     * ```ts
     * import { Random } from "@byloth/core";
     *
     * const iterator = new AggregatedAsyncIterator({
     *     _index: 0,
     *     next: async () =>
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
    public constructor(iterator: AsyncIterator<[K, T]>);

    /**
     * Initializes a new instance of the {@link AggregatedAsyncIterator} class.
     *
     * ```ts
     * import { range, Random } from "@byloth/core";
     *
     * const iterator = new AggregatedAsyncIterator(function* ()
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
     * Initializes a new instance of the {@link AggregatedAsyncIterator} class.
     *
     * ```ts
     * import { range, Random } from "@byloth/core";
     *
     * const iterator = new AggregatedAsyncIterator(async function* ()
     * {
     *     for await (const index of range(5))
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
    public constructor(generatorFn: AsyncGeneratorFunction<[K, T]>);

    /**
     * Initializes a new instance of the {@link AggregatedAsyncIterator} class.
     *
     * ```ts
     * const iterator = new AggregatedAsyncIterator(asyncKeyedValues);
     * ```
     *
     * ---
     *
     * @param argument The iterable, iterator or generator function to aggregate.
     */
    public constructor(argument: MaybeAsyncIteratorLike<[K, T]> | MaybeAsyncGeneratorFunction<[K, T]>);
    public constructor(argument: MaybeAsyncIteratorLike<[K, T]> | MaybeAsyncGeneratorFunction<[K, T]>)
    {
        this._elements = new SmartAsyncIterator(argument);
    }

    /**
     * Determines whether all elements of each group of the iterator satisfy a given condition.
     * See also {@link AggregatedAsyncIterator.some}.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator checjing if they satisfy the condition.  
     * Once a single element of one group doesn't satisfy the condition,
     * the result for the respective group will be `false`.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the boolean results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .every(async (key, value) => value >= 0);
     *
     * console.log(await results.toObject()); // { odd: false, even: true }
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the boolean results for each group.
     */
    public async every(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): Promise<ReducedIterator<K, boolean>>
    {
        const values = new Map<K, [number, boolean]>();

        for await (const [key, element] of this._elements)
        {
            const [index, result] = values.get(key) ?? [0, true];

            if (!(result)) { continue; }

            values.set(key, [index + 1, await predicate(key, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, result]] of values) { yield [key, result]; }
        });
    }

    /**
     * Determines whether any element of each group of the iterator satisfies a given condition.
     * See also {@link AggregatedAsyncIterator.every}.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator checjing if they satisfy the condition.  
     * Once a single element of one group satisfies the condition,
     * the result for the respective group will be `true`.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the boolean results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-5, -4, -3, -2, -1, 0])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .some(async (key, value) => value >= 0);
     *
     * console.log(await results.toObject()); // { odd: false, even: true }
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the boolean results for each group.
     */
    public async some(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): Promise<ReducedIterator<K, boolean>>
    {
        const values = new Map<K, [number, boolean]>();

        for await (const [key, element] of this._elements)
        {
            const [index, result] = values.get(key) ?? [0, false];

            if (result) { continue; }

            values.set(key, [index + 1, await predicate(key, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, result]] of values) { yield [key, result]; }
        });
    }

    /**
     * Filters the elements of the iterator based on a given condition.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * If the condition is met, the element will be included in the new iterator.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .filter(async (key, value) => value >= 0);
     *
     * console.log(await results.toObject()); // { odd: [3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link AggregatedAsyncIterator} containing the elements that satisfy the condition.
     */
    public filter(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): AggregatedAsyncIterator<K, T>;

    /**
     * Filters the elements of the iterator based on a given condition.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * If the condition is met, the element will be included in the new iterator.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, "-1", 0, "2", "3", 5, 6, "8"])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .filter<number>(async (key, value) => typeof value === "number");
     *
     * console.log(await results.toObject()); // { odd: [-3, 5], even: [0, 6] }
     * ```
     *
     * ---
     *
     * @template S
     * The type of the elements that satisfy the condition.  
     * This allows the type-system to infer the correct type of the new iterator.
     *
     * It must be a subtype of the original type of the elements.
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link AggregatedAsyncIterator} containing the elements that satisfy the condition.
     */
    public filter<S extends T>(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): AggregatedAsyncIterator<K, S>;
    public filter(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): AggregatedAsyncIterator<K, T>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[K, T]>
        {
            const indexes = new Map<K, number>();

            for await (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                if (await predicate(key, element, index)) { yield [key, element]; }

                indexes.set(key, index + 1);
            }
        });
    }

    /**
     * Maps the elements of the iterator using a given transformation function.
     *
     * This method will iterate over all elements of the iterator applying the condition.  
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
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .map(async (key, value) => Math.abs(value));
     *
     * console.log(await results.toObject()); // { odd: [3, 1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link AggregatedAsyncIterator} containing the transformed elements.
     */
    public map<V>(iteratee: MaybeAsyncKeyedIteratee<K, T, V>): AggregatedAsyncIterator<K, V>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[K, V]>
        {
            const indexes = new Map<K, number>();

            for await (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                yield [key, await iteratee(key, element, index)];

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
     * The first accoumulator value will be the first element of the iterator.  
     * The last accumulator value will be the final result of the reduction.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the reduced results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce(async (key, accumulator, value) => accumulator + value);
     *
     * console.log(await results.toObject()); // { odd: 4, even: 16 }
     * ```
     *
     * ---
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the reduced results for each group.
     */
    public async reduce(reducer: MaybeAsyncKeyedReducer<K, T, T>): Promise<ReducedIterator<K, T>>;

    /**
     * Reduces the elements of the iterator using a given reducer function.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator applying the reducer function.  
     * The result of each iteration will be passed as the accumulator to the next one.
     *
     * The first accoumulator value will be the provided initial value.  
     * The last accumulator value will be the final result of the reduction.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the reduced results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce(async (key, accumulator, value) => accumulator + value, 0);
     *
     * console.log(await results.toObject()); // { odd: 4, even: 16 }
     * ```
     *
     * ---
     *
     * @template A The type of the accumulator value which will also be the final result of the reduction.
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     * @param initialValue The initial value for the accumulator.
     *
     * @returns A new {@link ReducedIterator} containing the reduced results for each group.
     */
    public async reduce<A extends PropertyKey>(reducer: MaybeAsyncKeyedReducer<K, T, A>, initialValue: MaybePromise<A>)
        : Promise<ReducedIterator<K, A>>;

    /**
     * Reduces the elements of the iterator using a given reducer function.  
     * This method will consume the entire iterator in the process.
     *
     * It will iterate over all elements of the iterator applying the reducer function.  
     * The result of each iteration will be passed as the accumulator to the next one.
     *
     * The first accoumulator value will be the provided initial value by the given function.  
     * The last accumulator value will be the final result of the reduction.
     *
     * Eventually, it will return a new {@link ReducedIterator}
     * object that will contain all the reduced results for each group.  
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce(async (key, { value }, currentValue) => ({ value: value + currentValue }), (key) => ({ value: 0 }));
     *
     * console.log(await results.toObject()); // { odd: { value: 4 }, even: { value: 16 } }
     * ```
     *
     * ---
     *
     * @template A The type of the accumulator value which will also be the final result of the reduction.
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     * @param initialValue The function that provides the initial value for the accumulator.
     *
     * @returns A new {@link ReducedIterator} containing the reduced results for each group.
     */
    public async reduce<A>(reducer: MaybeAsyncKeyedReducer<K, T, A>, initialValue: (key: K) => MaybePromise<A>)
        : Promise<ReducedIterator<K, A>>;
    public async reduce<A>(
        reducer: MaybeAsyncKeyedReducer<K, T, A>, initialValue?: MaybePromise<A> | ((key: K) => MaybePromise<A>)
    ): Promise<ReducedIterator<K, A>>
    {
        const values = new Map<K, [number, A]>();

        for await (const [key, element] of this._elements)
        {
            let index: number;
            let accumulator: A;

            if (values.has(key)) { [index, accumulator] = values.get(key)!; }
            else if (initialValue !== undefined)
            {
                index = 0;

                if (initialValue instanceof Function) { accumulator = await initialValue(key); }
                else { accumulator = await initialValue; }
            }
            else
            {
                values.set(key, [0, (element as unknown) as A]);

                continue;
            }

            values.set(key, [index + 1, await reducer(key, accumulator, element, index)]);
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
     * Since the iterator is lazy, the mapping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([[-3, -1], [0, 2], [3, 5], [6, 8]])
     *     .groupBy(async ([value, _]) => value % 2 === 0 ? "even" : "odd")
     *     .flatMap(async (key, values) => values);
     *
     * console.log(await results.toObject()); // { odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link AggregatedAsyncIterator} containing the transformed elements.
     */
    public flatMap<V>(iteratee: MaybeAsyncKeyedIteratee<K, T, Iterable<V>>): AggregatedAsyncIterator<K, V>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[K, V]>
        {
            const indexes = new Map<K, number>();

            for await (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;
                const values = await iteratee(key, element, index);

                for await (const value of values) { yield [key, value]; }

                indexes.set(key, index + 1);
            }
        });
    }

    /**
     * Drops a given number of elements from the beginning of each group of the iterator.  
     * The remaining elements will be included in the new iterator.
     * See also {@link AggregatedAsyncIterator.take}.
     *
     * Since the iterator is lazy, the dropping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .drop(2);
     *
     * console.log(await results.toObject()); // { odd: [3, 5], even: [6, 8] }
     * ```
     *
     * ---
     *
     * @param count The number of elements to drop from the beginning of each group.
     *
     * @returns A new {@link AggregatedAsyncIterator} containing the remaining elements.
     */
    public drop(count: number): AggregatedAsyncIterator<K, T>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[K, T]>
        {
            const indexes = new Map<K, number>();

            for await (const [key, element] of elements)
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
     * See also {@link AggregatedAsyncIterator.drop}.
     *
     * Since the iterator is lazy, the taking process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .take(2);
     *
     * console.log(await results.toObject()); // { odd: [-3, -1], even: [0, 2] }
     * ```
     *
     * ---
     *
     * @param count The number of elements to take from the beginning of each group.
     *
     * @returns A new {@link AggregatedAsyncIterator} containing the taken elements.
     */
    public take(limit: number): AggregatedAsyncIterator<K, T>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[K, T]>
        {
            const indexes = new Map<K, number>();

            for await (const [key, element] of elements)
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
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .find(async (key, value) => value > 0);
     *
     * console.log(await results.toObject()); // { odd: 3, even: 2 }
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the first element that satisfies the condition for each group.
     */
    public async find(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): Promise<ReducedIterator<K, T | undefined>>;

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
     * const results = new SmartAsyncIterator<number | string>([-3, "-1", 0, "2", "3", 5, 6, "8"])
     *     .groupBy(async (value) => Number(value) % 2 === 0 ? "even" : "odd")
     *     .find<number>(async (key, value) => typeof value === "number");
     *
     * console.log(await results.toObject()); // { odd: -3, even: 0 }
     * ```
     *
     * ---
     *
     * @template S
     * The type of the elements that satisfy the condition.  
     * This allows the type-system to infer the correct type of the new iterator.
     *
     * It must be a subtype of the original type of the elements.
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link ReducedIterator} containing the first element that satisfies the condition for each group.
     */
    public async find<S extends T>(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>)
        : Promise<ReducedIterator<K, S | undefined>>;

    public async find(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): Promise<ReducedIterator<K, T | undefined>>
    {
        const values = new Map<K, [number, T | undefined]>();

        for await (const [key, element] of this._elements)
        {
            let [index, finding] = values.get(key) ?? [0, undefined];

            if (finding !== undefined) { continue; }
            if (await predicate(key, element, index)) { finding = element; }

            values.set(key, [index + 1, finding]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, finding]] of values) { yield [key, finding]; }
        });
    }

    /**
     * Enumerates the elements of the iterator.  
     * Each element is paired with its index within the group in the new iterator.
     *
     * Since the iterator is lazy, the enumeration process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, 0, 2, -1, 3])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .enumerate();
     *
     * console.log(results.toObject()); // { odd: [[0, -3], [1, -1], [2, 3]], even: [[0, 0], [1, 2]] }
     * ```
     *
     * ---
     *
     * @returns A new {@link AggregatedAsyncIterator} containing the enumerated elements.
     */
    public enumerate(): AggregatedAsyncIterator<K, [number, T]>
    {
        return this.map((key, value, index) => [index, value]);
    }

    /**
     * Removes all duplicate elements from within each group of the iterator.  
     * The first occurrence of each element will be included in the new iterator.
     *
     * Since the iterator is lazy, the uniqueness process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 6, -3, -1, 0, 5, 6, 8, 0, 2])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .unique();
     *
     * console.log(await results.toObject()); // { odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @returns A new {@link AggregatedAsyncIterator} containing only the unique elements.
     */
    public unique(): AggregatedAsyncIterator<K, T>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[K, T]>
        {
            const keys = new Map<K, Set<T>>();

            for await (const [key, element] of elements)
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
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .count();
     *
     * console.log(await results.toObject()); // { odd: 4, even: 4 }
     * ```
     *
     * ---
     *
     * @returns A new {@link ReducedIterator} containing the number of elements for each group.
     */
    public async count(): Promise<ReducedIterator<K, number>>
    {
        const counters = new Map<K, number>();

        for await (const [key] of this._elements)
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
     * const aggregator = new SmartAsyncIterator<number>([-3, 0, 2, -1, 3])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");
     *
     * await aggregator.forEach(async (key, value, index) =>
     * {
     *     console.log(`${index}: ${value}`); // "0: -3", "0: 0", "1: 2", "1: -1", "2: 3"
     * };
     * ```
     *
     * ---
     *
     * @param iteratee The function to execute for each element of the iterator.
     */
    public async forEach(iteratee: MaybeAsyncKeyedIteratee<K, T>): Promise<void>
    {
        const indexes = new Map<K, number>();

        for await (const [key, element] of this._elements)
        {
            const index = indexes.get(key) ?? 0;

            await iteratee(key, element, index);

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
     * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .map(async (key, value, index) => index % 2 === 0 ? value : -value)
     *     .reorganizeBy(async (key, value) => value >= 0 ? "+" : "-");
     *
     * console.log(await results.toObject()); // { "+": [1, 0, 3, 6], "-": [-3, -2, -5, -8] }
     * ```
     *
     * ---
     *
     * @template J The type of the new key.
     *
     * @param iteratee The function to determine the new key for each element of the iterator.
     *
     * @returns A new {@link AggregatedAsyncIterator} containing the elements reorganized by the new keys.
     */
    public reorganizeBy<J extends PropertyKey>(iteratee: MaybeAsyncKeyedIteratee<K, T, J>)
        : AggregatedAsyncIterator<J, T>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[J, T]>
        {
            const indexes = new Map<K, number>();

            for await (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                yield [await iteratee(key, element, index), element];

                indexes.set(key, index + 1);
            }
        });
    }

    /**
     * An utility method that returns a new {@link SmartAsyncIterator}
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
     * const keys = new SmartAsyncIterator([-3, Symbol(), "A", { }, null, [1 , 2, 3], false])
     *     .groupBy(async (value) => typeof value)
     *     .keys();
     *
     * console.log(await keys.toArray()); // ["number", "symbol", "string", "object", "boolean"]
     * ```
     *
     * ---
     *
     * @returns A new {@link SmartAsyncIterator} containing all the keys of the iterator.
     */
    public keys(): SmartAsyncIterator<K>
    {
        const elements = this._elements;

        return new SmartAsyncIterator<K>(async function* ()
        {
            const keys = new Set<K>();

            for await (const [key] of elements)
            {
                if (keys.has(key)) { continue; }
                keys.add(key);

                yield key;
            }
        });
    }

    /**
     * An utility method that returns a new {@link SmartAsyncIterator}
     * object containing all the entries of the iterator.
     *
     * Since the iterator is lazy, the entries will be extracted
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const entries = new SmartAsyncIterator<number>([-3, 0, 2, -1, 3])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .entries();
     *
     * console.log(await entries.toArray()); // [["odd", -3], ["even", 0], ["even", 2], ["odd", -1], ["odd", 3]]
     * ```
     *
     * ---
     *
     * @returns A new {@link SmartAsyncIterator} containing all the entries of the iterator.
     */
    public entries(): SmartAsyncIterator<[K, T]>
    {
        return this._elements;
    }

    /**
     * An utility method that returns a new {@link SmartAsyncIterator}
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
     * const values = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
     *     .values();
     *
     * console.log(await values.toArray()); // [-3, -1, 0, 2, 3, 5, 6, 8]
     * ```
     *
     * ---
     *
     * @returns A new {@link SmartAsyncIterator} containing all the values of the iterator.
     */
    public values(): SmartAsyncIterator<T>
    {
        const elements = this._elements;

        return new SmartAsyncIterator<T>(async function* ()
        {
            for await (const [_, element] of elements) { yield element; }
        });
    }

    /**
     * Materializes the iterator into an array of arrays.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const aggregator = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");
     *
     * console.log(await aggregator.toArray()); // [[-3, -1, 3, 5], [0, 2, 6, 8]]
     * ```
     *
     * ---
     *
     * @returns An {@link Array} of arrays containing the elements of the iterator.
     */
    public async toArray(): Promise<T[][]>
    {
        const map = await this.toMap();

        return Array.from(map.values());
    }

    /**
     * Materializes the iterator into a map.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const aggregator = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");
     *
     * console.log(await aggregator.toMap()); // Map(2) { "odd" => [-3, -1, 3, 5], "even" => [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @returns A {@link Map} containing the elements of the iterator.
     */
    public async toMap(): Promise<Map<K, T[]>>
    {
        const groups = new Map<K, T[]>();

        for await (const [key, element] of this._elements)
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
     * const aggregator = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");
     *
     * console.log(await aggregator.toObject()); // { odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] }
     * ```
     *
     * ---
     *
     * @returns An {@link Object} containing the elements of the iterator.
     */
    public async toObject(): Promise<Record<K, T[]>>
    {
        const groups = { } as Record<K, T[]>;

        for await (const [key, element] of this._elements)
        {
            const value = groups[key] ?? [];

            value.push(element);
            groups[key] = value;
        }

        return groups;
    }

    public readonly [Symbol.toStringTag]: string = "AggregatedAsyncIterator";
}
