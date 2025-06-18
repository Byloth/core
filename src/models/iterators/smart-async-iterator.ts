import AggregatedAsyncIterator from "../aggregators/aggregated-async-iterator.js";
import { ValueException } from "../exceptions/index.js";
import type { MaybePromise } from "../types.js";

import type {
    GeneratorFunction,
    AsyncGeneratorFunction,
    MaybeAsyncGeneratorFunction,
    MaybeAsyncIteratee,
    MaybeAsyncReducer,
    MaybeAsyncIteratorLike

} from "./types.js";

/**
 * A wrapper class representing an enhanced and instantiable version
 * of the native {@link AsyncIterable} & {@link AsyncIterator} interfaces.
 *
 * It provides a set of utility methods to better manipulate and transform
 * asynchronous iterators in a functional and highly performant way.  
 * It takes inspiration from the native {@link Array} methods like
 * {@link Array.map}, {@link Array.filter}, {@link Array.reduce}, etc...
 *
 * The class is lazy, meaning that the transformations are applied
 * only when the resulting iterator is materialized, not before.  
 * This allows to chain multiple transformations without
 * the need to iterate over the elements multiple times.
 *
 * ---
 *
 * @example
 * ```ts
 * const result = new SmartAsyncIterator<number>(["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5"])
 *     .map((value) => Number(value))
 *     .map((value) => value + Math.ceil(Math.abs(value / 2)))
 *     .filter((value) => value >= 0)
 *     .map((value) => value + 1)
 *     .reduce((acc, value) => acc + value);
 *
 * console.log(await result); // 31
 * ```
 *
 * ---
 *
 * @template T The type of elements in the iterator.
 * @template R The type of the final result of the iterator. Default is `void`.
 * @template N The type of the argument passed to the `next` method. Default is `undefined`.
 */
export default class SmartAsyncIterator<T, R = void, N = undefined> implements AsyncIterator<T, R, N>
{
    /**
     * The native {@link AsyncIterator} object that is being wrapped by this instance.
     */
    protected readonly _iterator: AsyncIterator<T, R, N>;

    /**
     * Initializes a new instance of the {@link SmartAsyncIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<string>(["A", "B", "C"]);
     * ```
     *
     * ---
     *
     * @param iterable The iterable object to wrap.
     */
    public constructor(iterable: Iterable<T>);

    /**
     * Initializes a new instance of the {@link SmartAsyncIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([1, 2, 3, 4, 5]);
     * ```
     *
     * ---
     *
     * @param iterable The asynchronous iterable object to wrap.
     */
    public constructor(iterable: AsyncIterable<T>);

    /**
     * Initializes a new instance of the {@link SmartAsyncIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number, void, number>({
     *     _sum: 0, _count: 0,
     *
     *     next: function(value: number)
     *     {
     *         this._sum += value;
     *         this._count += 1;
     *
     *         return { done: false, value: this._sum / this._count };
     *     }
     * })
     * ```
     *
     * ---
     *
     * @param iterator The iterator object to wrap.
     */
    public constructor(iterator: Iterator<T, R, N>);

    /**
     * Initializes a new instance of the {@link SmartAsyncIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number, void, number>({
     *     _sum: 0, _count: 0,
     *
     *     next: async function(value: number)
     *     {
     *         this._sum += value;
     *         this._count += 1;
     *
     *         return { done: false, value: this._sum / this._count };
     *     }
     * })
     * ```
     *
     * ---
     *
     * @param iterator The asynchronous iterator object to wrap.
     */
    public constructor(iterator: AsyncIterator<T, R, N>);

    /**
     * Initializes a new instance of the {@link SmartAsyncIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>(function* ()
     * {
     *     for (let i = 2; i < 65_536; i *= 2) { yield (i - 1); }
     * });
     * ```
     *
     * ---
     *
     * @param generatorFn The generator function to wrap.
     */
    public constructor(generatorFn: GeneratorFunction<T, R, N>);

    /**
     * Initializes a new instance of the {@link SmartAsyncIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>(async function* ()
     * {
     *     for await (let i = 2; i < 65_536; i *= 2) { yield (i - 1); }
     * });
     * ```
     *
     * ---
     *
     * @param generatorFn The asynchronous generator function to wrap.
     */
    public constructor(generatorFn: AsyncGeneratorFunction<T, R, N>);

    /**
     * Initializes a new instance of the {@link SmartAsyncIterator} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator(values);
     * ```
     *
     * ---
     *
     * @param argument The synchronous or asynchronous iterable, iterator or generator function to wrap.
     */
    public constructor(argument: MaybeAsyncIteratorLike<T, R, N> | MaybeAsyncGeneratorFunction<T, R, N>);
    public constructor(argument: MaybeAsyncIteratorLike<T, R, N> | MaybeAsyncGeneratorFunction<T, R, N>)
    {
        if (argument instanceof Function)
        {
            const generator = argument();
            if (Symbol.asyncIterator in generator)
            {
                this._iterator = generator;
            }
            else
            {
                this._iterator = (async function* ()
                {
                    let next: [] | [N] = [];

                    while (true)
                    {
                        const result = generator.next(...next);
                        if (result.done) { return result.value; }

                        next = [yield result.value];
                    }

                })();
            }
        }
        else if (Symbol.asyncIterator in argument)
        {
            this._iterator = argument[Symbol.asyncIterator]() as AsyncIterator<T, R, N>;
        }
        else if (Symbol.iterator in argument)
        {
            const iterator = argument[Symbol.iterator]();
            this._iterator = (async function* ()
            {
                while (true)
                {
                    const result = iterator.next();
                    if (result.done) { return result.value; }

                    yield result.value;
                }

            })();
        }
        else
        {
            this._iterator = (async function* ()
            {
                let next: [] | [N] = [];

                while (true)
                {
                    const result: IteratorResult<T, R> = await argument.next(...next);
                    if (result.done) { return result.value; }

                    next = [yield result.value];
                }

            })();
        }
    }

    /**
     * Determines whether all elements of the iterator satisfy a given condition.
     * See also {@link SmartAsyncIterator.some}.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once a single element doesn't satisfy the condition, the method will return `false` immediately.
     *
     * This may lead to an unknown final state of the iterator, which may be entirely or partially consumed.  
     * For this reason, it's recommended to consider it as consumed in any case and to not use it anymore.  
     * Consider using {@link SmartAsyncIterator.find} instead.
     *
     * If the iterator is infinite and every element satisfies the condition, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([-2, -1, 0, 1, 2]);
     * const result = await iterator.every(async (value) => value < 0);
     *
     * console.log(result); // false
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns
     * A {@link Promise} that will resolve to `true` if all elements satisfy the condition, `false` otherwise.
     */
    public async every(predicate: MaybeAsyncIteratee<T, boolean>): Promise<boolean>
    {
        let index = 0;

        while (true)
        {
            const result = await this._iterator.next();

            if (result.done) { return true; }
            if (!(await predicate(result.value, index))) { return false; }

            index += 1;
        }
    }

    /**
     * Determines whether any element of the iterator satisfies a given condition.
     * See also {@link SmartAsyncIterator.every}.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once a single element satisfies the condition, the method will return `true` immediately.
     *
     * This may lead to an unknown final state of the iterator, which may be entirely or partially consumed.  
     * For this reason, it's recommended to consider it as consumed in any case and to not use it anymore.  
     * Consider using {@link SmartAsyncIterator.find} instead.
     *
     * If the iterator is infinite and no element satisfies the condition, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([-2, -1, 0, 1, 2]);
     * const result = await iterator.some(async (value) => value > 0);
     *
     * console.log(result); // true
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns
     * A {@link Promise} that will resolve to `true` if any element satisfies the condition, `false` otherwise.
     */
    public async some(predicate: MaybeAsyncIteratee<T, boolean>): Promise<boolean>
    {
        let index = 0;

        while (true)
        {
            const result = await this._iterator.next();

            if (result.done) { return false; }
            if (await predicate(result.value, index)) { return true; }

            index += 1;
        }
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
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.filter(async (value) => value < 0);
     *
     * console.log(await result.toArray()); // [-2, -1]
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link SmartAsyncIterator} containing only the elements that satisfy the condition.
     */
    public filter(predicate: MaybeAsyncIteratee<T, boolean>): SmartAsyncIterator<T, R>;

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
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number | string>([-2, "-1", "0", 1, "2"]);
     * const result = iterator.filter<number>(async (value) => typeof value === "number");
     *
     * console.log(await result.toArray()); // [-2, 1]
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
     * @param predicate The type guard condition to check for each element of the iterator.
     *
     * @returns A new {@link SmartAsyncIterator} containing only the elements that satisfy the condition.
     */
    public filter<S extends T>(predicate: MaybeAsyncIteratee<T, boolean>): SmartAsyncIterator<S, R>;
    public filter(predicate: MaybeAsyncIteratee<T, boolean>): SmartAsyncIterator<T, R>
    {
        const iterator = this._iterator;

        return new SmartAsyncIterator<T, R>(async function* ()
        {
            let index = 0;
            while (true)
            {
                const result = await iterator.next();
                if (result.done) { return result.value; }
                if (await predicate(result.value, index)) { yield result.value; }

                index += 1;
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
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.map(async (value) => Math.abs(value));
     *
     * console.log(await result.toArray()); // [2, 1, 0, 1, 2]
     * ```
     *
     * ---
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link SmartAsyncIterator} containing the transformed elements.
     */
    public map<V>(iteratee: MaybeAsyncIteratee<T, V>): SmartAsyncIterator<V, R>
    {
        const iterator = this._iterator;

        return new SmartAsyncIterator<V, R>(async function* ()
        {
            let index = 0;
            while (true)
            {
                const result = await iterator.next();
                if (result.done) { return result.value; }

                yield await iteratee(result.value, index);

                index += 1;
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
     * Also note that:
     * - If an empty iterator is provided, a {@link ValueException} will be thrown.
     * - If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([1, 2, 3, 4, 5]);
     * const result = await iterator.reduce(async (acc, value) => acc + value);
     *
     * console.log(result); // 15
     * ```
     *
     * ---
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     *
     * @returns A {@link Promise} that will resolve to the final result of the reduction.
     */
    public async reduce(reducer: MaybeAsyncReducer<T, T>): Promise<T>;

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
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([1, 2, 3, 4, 5]);
     * const result = await iterator.reduce(async (acc, value) => acc + value, 10);
     *
     * console.log(result); // 25
     * ```
     *
     * ---
     *
     * @template A The type of the accumulator value which will also be the type of the final result of the reduction.
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     * @param initialValue The initial value of the accumulator.
     *
     * @returns A {@link Promise} that will resolve to the final result of the reduction.
     */
    public async reduce<A>(reducer: MaybeAsyncReducer<T, A>, initialValue: A): Promise<A>;
    public async reduce<A>(reducer: MaybeAsyncReducer<T, A>, initialValue?: A): Promise<A>
    {
        let index = 0;
        let accumulator = initialValue;
        if (accumulator === undefined)
        {
            const result = await this._iterator.next();
            if (result.done) { throw new ValueException("Cannot reduce an empty iterator without an initial value."); }

            accumulator = (result.value as unknown) as A;
            index += 1;
        }

        while (true)
        {
            const result = await this._iterator.next();
            if (result.done) { return accumulator; }

            accumulator = await reducer(accumulator, result.value, index);

            index += 1;
        }
    }

    /**
     * Flattens the elements of the iterator using a given transformation function.
     *
     * This method will iterate over all elements of the iterator applying the transformation function.  
     * The result of each transformation will be flattened and included in the new iterator.
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
     * const iterator = new SmartAsyncIterator<number[]>([[-2, -1], 0, 1, 2, [3, 4, 5]]);
     * const result = iterator.flatMap(async (value) => value);
     *
     * console.log(await result.toArray()); // [-2, -1, 0, 1, 2, 3, 4, 5]
     * ```
     *
     * ---
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link SmartAsyncIterator} containing the flattened elements.
     */
    public flatMap<V>(iteratee: MaybeAsyncIteratee<T, V | readonly V[]>): SmartAsyncIterator<V, R>
    {
        const iterator = this._iterator;

        return new SmartAsyncIterator<V, R>(async function* ()
        {
            let index = 0;
            while (true)
            {
                const result = await iterator.next();
                if (result.done) { return result.value; }

                const elements = await iteratee(result.value, index);
                if (elements instanceof Array)
                {
                    for (const value of elements) { yield value; }
                }
                else { yield elements; }

                index += 1;
            }
        });
    }

    /**
     * Drops a given number of elements at the beginning of the iterator.  
     * The remaining elements will be included in a new iterator.
     * See also {@link SmartAsyncIterator.take}.
     *
     * Since the iterator is lazy, the dropping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * Only the dropped elements will be consumed in the process.  
     * The rest of the iterator will be consumed only once the new one is.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.drop(3);
     *
     * console.log(await result.toArray()); // [1, 2]
     * ```
     *
     * ---
     *
     * @param count The number of elements to drop.
     *
     * @returns A new {@link SmartAsyncIterator} containing the remaining elements.
     */
    public drop(count: number): SmartAsyncIterator<T, R | undefined>
    {
        const iterator = this._iterator;

        return new SmartAsyncIterator<T, R | undefined>(async function* ()
        {
            let index = 0;
            while (index < count)
            {
                const result = await iterator.next();
                if (result.done) { return; }

                index += 1;
            }

            while (true)
            {
                const result = await iterator.next();
                if (result.done) { return result.value; }

                yield result.value;
            }
        });
    }

    /**
     * Takes a given number of elements at the beginning of the iterator.  
     * These elements will be included in a new iterator.
     * See also {@link SmartAsyncIterator.drop}.
     *
     * Since the iterator is lazy, the taking process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * Only the taken elements will be consumed from the original iterator.  
     * The rest of the original iterator will be available for further consumption.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.take(3);
     *
     * console.log(await result.toArray()); // [-2, -1, 0]
     * console.log(await iterator.toArray()); // [1, 2]
     * ```
     *
     * ---
     *
     * @param limit The number of elements to take.
     *
     * @returns A new {@link SmartAsyncIterator} containing the taken elements.
     */
    public take(limit: number): SmartAsyncIterator<T, R | undefined>
    {
        const iterator = this._iterator;

        return new SmartAsyncIterator<T, R | undefined>(async function* ()
        {
            let index = 0;
            while (index < limit)
            {
                const result = await iterator.next();
                if (result.done) { return result.value; }

                yield result.value;

                index += 1;
            }

            return;
        });
    }

    /**
     * Finds the first element of the iterator that satisfies a given condition.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * The first element that satisfies the condition will be returned immediately.
     *
     * Only the elements that are necessary to find the first
     * satisfying one will be consumed from the original iterator.  
     * The rest of the original iterator will be available for further consumption.
     *
     * Also note that:
     * - If no element satisfies the condition, `undefined` will be returned once the entire iterator is consumed.
     * - If the iterator is infinite and no element satisfies the condition, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([-2, -1, 0, 1, 2]);
     * const result = await iterator.find(async (value) => value > 0);
     *
     * console.log(result); // 1
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns
     * A {@link Promise} that will resolve to the first element that satisfies the condition, `undefined` otherwise.
     */
    public async find(predicate: MaybeAsyncIteratee<T, boolean>): Promise<T | undefined>;

    /**
     * Finds the first element of the iterator that satisfies a given condition.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * The first element that satisfies the condition will be returned immediately.
     *
     * Only the elements that are necessary to find the first
     * satisfying one will be consumed from the original iterator.  
     * The rest of the original iterator will be available for further consumption.
     *
     * Also note that:
     * - If no element satisfies the condition, `undefined` will be returned once the entire iterator is consumed.
     * - If the iterator is infinite and no element satisfies the condition, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number | string>([-2, "-1", "0", 1, "2"]);
     * const result = await iterator.find<number>(async (value) => typeof value === "number");
     *
     * console.log(result); // -2
     * ```
     *
     * ---
     *
     * @template S
     * The type of the element that satisfies the condition.  
     * This allows the type-system to infer the correct type of the result.
     *
     * It must be a subtype of the original type of the elements.
     *
     * @param predicate The type guard condition to check for each element of the iterator.
     *
     * @returns
     * A {@link Promise} that will resolve to the first element that satisfies the condition, `undefined` otherwise. 
     */
    public async find<S extends T>(predicate: MaybeAsyncIteratee<T, boolean>): Promise<S | undefined>;
    public async find(predicate: MaybeAsyncIteratee<T, boolean>): Promise<T | undefined>
    {
        let index = 0;

        while (true)
        {
            const result = await this._iterator.next();

            if (result.done) { return; }
            if (await predicate(result.value, index)) { return result.value; }

            index += 1;
        }
    }

    /**
     * Enumerates the elements of the iterator.  
     * Each element is be paired with its index in a new iterator.
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
     * const iterator = new SmartAsyncIterator<string>(["A", "M", "N", "Z"]);
     * const result = iterator.enumerate();
     *
     * for await (const [index, value] of result)
     * {
     *     console.log(`${index}: ${value}`); // "0: A", "1: M", "2: N", "3: Z"
     * }
     * ```
     *
     * ---
     *
     * @returns A new {@link SmartAsyncIterator} containing the enumerated elements.
     */
    public enumerate(): SmartAsyncIterator<[number, T], R>
    {
        return this.map((value, index) => [index, value]);
    }

    /**
     * Removes all duplicate elements from the iterator.  
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
     * const iterator = new SmartAsyncIterator<number>([1, 1, 2, 3, 2, 3, 4, 5, 5, 4]);
     * const result = iterator.unique();
     *
     * console.log(await result.toArray()); // [1, 2, 3, 4, 5]
     * ```
     *
     * ---
     *
     * @returns A new {@link SmartAsyncIterator} containing only the unique elements.
     */
    public unique(): SmartAsyncIterator<T, R>
    {
        const iterator = this._iterator;

        return new SmartAsyncIterator<T, R>(async function* ()
        {
            const values = new Set<T>();
            while (true)
            {
                const result = await iterator.next();
                if (result.done) { return result.value; }
                if (values.has(result.value)) { continue; }

                values.add(result.value);

                yield result.value;
            }
        });
    }

    /**
     * Counts the number of elements in the iterator.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([1, 2, 3, 4, 5]);
     * const result = await iterator.count();
     *
     * console.log(result); // 5
     * ```
     *
     * ---
     *
     * @returns A {@link Promise} that will resolve to the number of elements in the iterator.
     */
    public async count(): Promise<number>
    {
        let index = 0;

        while (true)
        {
            const result = await this._iterator.next();
            if (result.done) { return index; }

            index += 1;
        }
    }

    /**
     * Iterates over all elements of the iterator.  
     * The elements are passed to the function along with their index.
     *
     * This method will consume the entire iterator in the process.  
     * If the iterator is infinite, the method will never return.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>(["A", "M", "N", "Z"]);
     * await iterator.forEach(async (value, index) =>
     * {
     *     console.log(`${index}: ${value}`); // "0: A", "1: M", "2: N", "3: Z"
     * }
     * ```
     *
     * ---
     *
     * @param iteratee The function to apply to each element of the iterator.
     *
     * @returns A {@link Promise} that will resolve once the iteration is complete.
     */
    public async forEach(iteratee: MaybeAsyncIteratee<T>): Promise<void>
    {
        let index = 0;

        while (true)
        {
            const result = await this._iterator.next();
            if (result.done) { return; }

            await iteratee(result.value, index);

            index += 1;
        }
    }

    /**
     * Advances the iterator to the next element and returns the result.  
     * If the iterator requires it, a value must be provided to be passed to the next element.
     *
     * Once the iterator is done, the method will return an object with the `done` property set to `true`.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([1, 2, 3, 4, 5]);
     *
     * let result = await iterator.next();
     * while (!result.done)
     * {
     *     console.log(result.value); // 1, 2, 3, 4, 5
     *
     *     result = await iterator.next();
     * }
     *
     * console.log(result); // { done: true, value: undefined }
     * ```
     *
     * ---
     *
     * @param values The value to pass to the next element, if required.
     *
     * @returns
     * A {@link Promise} that will resolve to the result of the iteration, containing the value of the operation.
     */
    public next(...values: N extends undefined ? [] : [N]): Promise<IteratorResult<T, R>>
    {
        return this._iterator.next(...values);
    }

    /**
     * An utility method that may be used to close the iterator gracefully,
     * free the resources and perform any cleanup operation.  
     * It may also be used to signal the end or to compute a specific final result of the iteration process.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>({
     *     _index: 0,
     *     next: async function()
     *     {
     *         return { done: false, value: this._index += 1 };
     *     },
     *     return: async function() { console.log("Closing the iterator..."); }
     * });
     *
     * for await (const value of iterator)
     * {
     *     if (value > 5) { break; } // "Closing the iterator..."
     *
     *     console.log(value); // 1, 2, 3, 4, 5
     * }
     * ```
     *
     * ---
     *
     * @param value The final value of the iterator.
     *
     * @returns A {@link Promise} that will resolve to the final result of the iterator.
     */
    public async return(value?: MaybePromise<R>): Promise<IteratorResult<T, R>>
    {
        const _value = (await value) as R;

        if (this._iterator.return) { return await this._iterator.return(_value); }

        return { done: true, value: _value };
    }

    /**
     * An utility method that may be used to close the iterator due to an error,
     * free the resources and perform any cleanup operation.  
     * It may also be used to signal that an error occurred during the iteration process or to handle it.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>({
     *     _index: 0,
     *     next: async function()
     *     {
     *         return { done: this._index > 10, value: this._index += 1 };
     *     },
     *     throw: async function(error)
     *     {
     *         console.warn(error.message);
     *
     *         this._index = 0;
     *     }
     * });
     *
     * for await (const value of iterator) // 1, 2, 3, 4, 5, "The index is too high.", 1, 2, 3, 4, 5, ...
     * {
     *     try
     *     {
     *         if (value > 5) { throw new Error("The index is too high."); }
     *
     *         console.log(value); // 1, 2, 3, 4, 5
     *     }
     *     catch (error) { await iterator.throw(error); }
     * }
     * ```
     *
     * ---
     *
     * @param error The error to throw into the iterator.
     *
     * @returns A {@link Promise} that will resolve to the final result of the iterator.
     */
    public throw(error: unknown): Promise<IteratorResult<T, R>>
    {
        if (this._iterator.throw) { return this._iterator.throw(error); }

        throw error;
    }

    /**
     * An utility method that aggregates the elements of the iterator using a given key function.  
     * The elements will be grouped by the resulting keys in a new specialized iterator.
     * See {@link AggregatedAsyncIterator}.
     *
     * Since the iterator is lazy, the grouping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * the new one is and that consuming one of them will consume the other as well.
     *
     * ---
     *
     * @example
     * ```ts
     * const iterator = new SmartAsyncIterator<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
     * const result = iterator.groupBy<string>(async (value) => value % 2 === 0 ? "even" : "odd");
     *
     * console.log(await result.toObject()); // { odd: [1, 3, 5, 7, 9], even: [2, 4, 6, 8, 10] }
     * ```
     *
     * ---
     *
     * @template K The type of the keys used to group the elements.
     *
     * @param iteratee The key function to apply to each element of the iterator.
     *
     * @returns A new instance of the {@link AggregatedAsyncIterator} class containing the grouped elements.
     */
    public groupBy<K extends PropertyKey>(iteratee: MaybeAsyncIteratee<T, K>): AggregatedAsyncIterator<K, T>
    {
        return new AggregatedAsyncIterator(this.map(async (element, index) =>
        {
            const key = await iteratee(element, index);

            return [key, element] as [K, T];
        }));
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
     * const iterator = new SmartAsyncIterator(async function* ()
     * {
     *     for (let i = 0; i < 5; i += 1) { yield i; }
     * });
     * const result = await iterator.toArray();
     *
     * console.log(result); // [0, 1, 2, 3, 4]
     * ```
     *
     * ---
     *
     * @returns A {@link Promise} that will resolve to an array containing all elements of the iterator.
     */
    public toArray(): Promise<T[]>
    {
        return Array.fromAsync(this as AsyncIterable<T>);
    }

    public readonly [Symbol.toStringTag]: string = "SmartAsyncIterator";

    public [Symbol.asyncIterator](): SmartAsyncIterator<T, R, N> { return this; }
}
