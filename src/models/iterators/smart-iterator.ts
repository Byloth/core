import AggregatedIterator from "../aggregators/aggregated-iterator.js";
import { ValueException } from "../exceptions/index.js";

import type { GeneratorFunction, Iteratee, TypeGuardPredicate, Reducer, IteratorLike } from "./types.js";

/**
 * A wrapper class representing an enhanced and instantiable version
 * of the native {@link Iterable} & {@link Iterator} interfaces.
 *
 * It provides a set of utility methods to better manipulate and
 * transform iterators in a functional and highly performant way.  
 * It takes inspiration from the native {@link Array} methods like
 * {@link Array.map}, {@link Array.filter}, {@link Array.reduce}, etc...
 *
 * The class is lazy, meaning that the transformations are applied
 * only when the resulting iterator is materialized, not before.  
 * This allows to chain multiple transformations without
 * the need to iterate over the elements multiple times.
 *
 * ```ts
 * const result = new SmartIterator<number>(["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5"])
 *     .map(Number)
 *     .map((value) => value + Math.ceil(Math.abs(value / 2)))
 *     .filter((value) => value >= 0)
 *     .map((value) => value + 1)
 *     .reduce((acc, value) => acc + value);
 *
 * console.log(result); // 31
 * ```
 *
 * @template T The type of elements in the iterator.
 * @template R The type of the final result of the iterator. Default is `void`.
 * @template N The type of the argument required by the `next` method. Default is `undefined`.
 */
export default class SmartIterator<T, R = void, N = undefined> implements Iterator<T, R, N>
{
    /**
     * The native {@link Iterator} object that is being wrapped by this instance.
     */
    protected _iterator: Iterator<T, R, N>;

    /**
     * Initializes a new instance of the {@link SmartIterator} class.
     *
     * ```ts
     * const iterator = new SmartIterator<string>(["A", "B", "C"]);
     * ```
     *
     * @param iterable The iterable object to wrap.
     */
    public constructor(iterable: Iterable<T, R, N>);

    /**
     * Initializes a new instance of the {@link SmartIterator} class.
     *
     * ```ts
     * const iterator = new SmartIterator<number, void, number>({
     *     _sum: 0, _count: 0,
     *
     *     next: function (value: number)
     *     {
     *         this._sum += value;
     *         this._count += 1;
     *
     *         return { done: false, value: this._sum / this._count };
     *     }
     * })
     * ```
     *
     * @param iterator The iterator object to wrap.
     */
    public constructor(iterator: Iterator<T, R, N>);

    /**
     * Initializes a new instance of the {@link SmartIterator} class.
     *
     * ```ts
     * const iterator = new SmartIterator<number>(function* ()
     * {
     *     for (let i = 2; i < 65_536; i *= 2) { yield (i - 1); }
     * });
     * ```
     *
     * @param generatorFn The generator function to wrap.
     */
    public constructor(generatorFn: GeneratorFunction<T, R, N>);

    /**
     * Initializes a new instance of the {@link SmartIterator} class.
     *
     * ```ts
     * const iterator = new SmartIterator(values);
     * ```
     *
     * @param argument The iterable, iterator or generator function to wrap.
     */
    public constructor(argument: IteratorLike<T, R, N> | GeneratorFunction<T, R, N>);
    public constructor(argument: IteratorLike<T, R, N> | GeneratorFunction<T, R, N>)
    {
        if (argument instanceof Function)
        {
            this._iterator = argument();
        }
        else if (Symbol.iterator in argument)
        {
            this._iterator = argument[Symbol.iterator]() as Iterator<T, R, N>;
        }
        else
        {
            this._iterator = argument;
        }
    }

    /**
     * Determines whether all elements of the iterator satisfy a given condition.
     * See also {@link SmartIterator.some}.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once a single element doesn't satisfy the condition, the method will return `false` immediately.
     *
     * This may lead to an unknown final state of the iterator, which may be entirely or partially consumed.  
     * For this reason, it's recommended to consider it as consumed in any case and to not use it anymore.  
     * Consider using {@link SmartIterator.find} instead.
     *
     * If the iterator is infinite and every element satisfies the condition, the method will never return.
     *
     * ```ts
     * const iterator = new SmartIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.every((value) => value < 0);
     *
     * console.log(result); // false
     * ```
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns `true` if all elements satisfy the condition, `false` otherwise.
     */
    public every(predicate: Iteratee<T, boolean>): boolean
    {
        let index = 0;

        while (true)
        {
            const result = this._iterator.next();

            if (result.done) { return true; }
            if (!(predicate(result.value, index))) { return false; }

            index += 1;
        }
    }

    /**
     * Determines whether any element of the iterator satisfies a given condition.
     * See also {@link SmartIterator.every}.
     *
     * This method will iterate over all elements of the iterator checking if they satisfy the condition.  
     * Once a single element satisfies the condition, the method will return `true` immediately.
     *
     * This may lead to an unknown final state of the iterator, which may be entirely or partially consumed.  
     * For this reason, it's recommended to consider it as consumed in any case and to not use it anymore.  
     * Consider using {@link SmartIterator.find} instead.
     *
     * If the iterator is infinite and no element satisfies the condition, the method will never return.
     *
     * ```ts
     * const iterator = new SmartIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.some((value) => value < 0);
     *
     * console.log(result); // true
     * ```
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns `true` if any element satisfies the condition, `false` otherwise.
     */
    public some(predicate: Iteratee<T, boolean>): boolean
    {
        let index = 0;

        while (true)
        {
            const result = this._iterator.next();

            if (result.done) { return false; }
            if (predicate(result.value, index)) { return true; }

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
     * ```ts
     * const iterator = new SmartIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.filter((value) => value < 0);
     *
     * console.log(result.toArray()); // [-2, -1]
     * ```
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns A new {@link SmartIterator} containing only the elements that satisfy the condition.
     */
    public filter(predicate: Iteratee<T, boolean>): SmartIterator<T, R>;

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
     * const iterator = new SmartIterator<number | string>([-2, "-1", "0", 1, "2"]);
     * const result = iterator.filter<number>((value) => typeof value === "number");
     *
     * console.log(result.toArray()); // [-2, 1]
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
     * @returns A new {@link SmartIterator} containing only the elements that satisfy the condition.
     */
    public filter<S extends T>(predicate: TypeGuardPredicate<T, S>): SmartIterator<S, R>;
    public filter(predicate: Iteratee<T, boolean>): SmartIterator<T, R>
    {
        const iterator = this._iterator;

        return new SmartIterator<T, R>(function* ()
        {
            let index = 0;
            while (true)
            {
                const result = iterator.next();
                if (result.done) { return result.value; }
                if (predicate(result.value, index)) { yield result.value; }

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
     * ```ts
     * const iterator = new SmartIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.map((value) => Math.abs(value));
     *
     * console.log(result.toArray()); // [2, 1, 0, 1, 2]
     * ```
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link SmartIterator} containing the transformed elements.
     */
    public map<V>(iteratee: Iteratee<T, V>): SmartIterator<V, R>
    {
        const iterator = this._iterator;

        return new SmartIterator<V, R>(function* ()
        {
            let index = 0;
            while (true)
            {
                const result = iterator.next();
                if (result.done) { return result.value; }

                yield iteratee(result.value, index);

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
     * ```ts
     * const iterator = new SmartIterator<number>([1, 2, 3, 4, 5]);
     * const result = iterator.reduce((acc, value) => acc + value);
     *
     * console.log(result); // 15
     * ```
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     *
     * @returns The final result of the reduction.
     */
    public reduce(reducer: Reducer<T, T>): T;

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
     * ```ts
     * const iterator = new SmartIterator<number>([1, 2, 3, 4, 5]);
     * const result = iterator.reduce((acc, value) => acc + value, 10);
     *
     * console.log(result); // 25
     * ```
     *
     * @template A The type of the accumulator value which will also be the type of the final result of the reduction.
     *
     * @param reducer The reducer function to apply to each element of the iterator.
     * @param initialValue The initial value of the accumulator.
     *
     * @returns The final result of the reduction.
     */
    public reduce<A>(reducer: Reducer<T, A>, initialValue: A): A;
    public reduce<A>(reducer: Reducer<T, A>, initialValue?: A): A
    {
        let index = 0;
        let accumulator = initialValue;
        if (accumulator === undefined)
        {
            const result = this._iterator.next();
            if (result.done) { throw new ValueException("Cannot reduce an empty iterator without an initial value."); }

            accumulator = (result.value as unknown) as A;
            index += 1;
        }

        while (true)
        {
            const result = this._iterator.next();
            if (result.done) { return accumulator; }

            accumulator = reducer(accumulator, result.value, index);

            index += 1;
        }
    }

    /**
     * Flattens the elements of the iterator using a given transformation function.
     *
     * This method will iterate over all elements of the iterator applying the transformation function.  
     * The result of each transformation will be flattened into the new iterator.
     *
     * Since the iterator is lazy, the flattening process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const iterator = new SmartIterator<number[]>([[-2, -1], 0, 1, 2, [3, 4, 5]]);
     * const result = iterator.flatMap((value) => value);
     *
     * console.log(result.toArray()); // [-2, -1, 0, 1, 2, 3, 4, 5]
     * ```
     *
     * @template V The type of the elements after the transformation.
     *
     * @param iteratee The transformation function to apply to each element of the iterator.
     *
     * @returns A new {@link SmartIterator} containing the flattened elements.
     */
    public flatMap<V>(iteratee: Iteratee<T, V | readonly V[]>): SmartIterator<V, R>
    {
        const iterator = this._iterator;

        return new SmartIterator<V, R>(function* ()
        {
            let index = 0;
            while (true)
            {
                const result = iterator.next();
                if (result.done) { return result.value; }

                const elements = iteratee(result.value, index);
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
     * See also {@link SmartIterator.take}.
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
     * ```ts
     * const iterator = new SmartIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.drop(3);
     *
     * console.log(result.toArray()); // [1, 2]
     * ```
     *
     * @param count The number of elements to drop.
     *
     * @returns A new {@link SmartIterator} containing the remaining elements.
     */
    public drop(count: number): SmartIterator<T, R | undefined>
    {
        const iterator = this._iterator;

        return new SmartIterator<T, R | undefined>(function* ()
        {
            let index = 0;
            while (index < count)
            {
                const result = iterator.next();
                if (result.done) { return; }

                index += 1;
            }

            while (true)
            {
                const result = iterator.next();
                if (result.done) { return result.value; }

                yield result.value;
            }
        });
    }

    /**
     * Takes a given number of elements at the beginning of the iterator.  
     * These elements will be included in a new iterator.
     * See also {@link SmartIterator.drop}.
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
     * ```ts
     * const iterator = new SmartIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.take(3);
     *
     * console.log(result.toArray()); // [-2, -1, 0]
     * console.log(iterator.toArray()); // [1, 2]
     * ```
     *
     * @param limit The number of elements to take.
     *
     * @returns A new {@link SmartIterator} containing the taken elements.
     */
    public take(limit: number): SmartIterator<T, R | undefined>
    {
        const iterator = this._iterator;

        return new SmartIterator<T, R | undefined>(function* ()
        {
            let index = 0;
            while (index < limit)
            {
                const result = iterator.next();
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
     * ```ts
     * const iterator = new SmartIterator<number>([-2, -1, 0, 1, 2]);
     * const result = iterator.find((value) => value > 0);
     *
     * console.log(result); // 1
     * ```
     *
     * @param predicate The condition to check for each element of the iterator.
     *
     * @returns The first element that satisfies the condition, `undefined` otherwise.
     */
    public find(predicate: Iteratee<T, boolean>): T | undefined;

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
     * ```ts
     * const iterator = new SmartIterator<number | string>([-2, "-1", "0", 1, "2"]);
     * const result = iterator.find<number>((value) => typeof value === "number");
     *
     * console.log(result); // -2
     * ```
     *
     * @template S
     * The type of the element that satisfies the condition.  
     * This allows the type-system to infer the correct type of the result.
     *
     * It must be a subtype of the original type of the elements.
     *
     * @param predicate The type guard condition to check for each element of the iterator.
     *
     * @returns The first element that satisfies the condition, `undefined` otherwise.
     */
    public find<S extends T>(predicate: TypeGuardPredicate<T, S>): S | undefined;
    public find(predicate: Iteratee<T, boolean>): T | undefined
    {
        let index = 0;

        while (true)
        {
            const result = this._iterator.next();

            if (result.done) { return; }
            if (predicate(result.value, index)) { return result.value; }

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
     * ```ts
     * const iterator = new SmartIterator<string>(["A", "M", "N", "Z"]);
     * const result = iterator.enumerate();
     *
     * console.log(result.toArray()); // [[0, "A"], [1, "M"], [2, "N"], [3, "Z"]]
     * ```
     *
     * @returns A new {@link SmartIterator} containing the enumerated elements.
     */
    public enumerate(): SmartIterator<[number, T], R>
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
     * ```ts
     * const iterator = new SmartIterator<number>([1, 1, 2, 3, 2, 3, 4, 5, 5, 4]);
     * const result = iterator.unique();
     *
     * console.log(result.toArray()); // [1, 2, 3, 4, 5]
     * ```
     *
     * @returns A new {@link SmartIterator} containing only the unique elements.
     */
    public unique(): SmartIterator<T, R>
    {
        const iterator = this._iterator;

        return new SmartIterator<T, R>(function* ()
        {
            const values = new Set<T>();
            while (true)
            {
                const result = iterator.next();
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
     * ```ts
     * const iterator = new SmartIterator<number>([1, 2, 3, 4, 5]);
     * const result = iterator.count();
     *
     * console.log(result); // 5
     * ```
     *
     * @returns The number of elements in the iterator.
     */
    public count(): number
    {
        let index = 0;

        while (true)
        {
            const result = this._iterator.next();
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
     * ```ts
     * const iterator = new SmartIterator<number>(["A", "M", "N", "Z"]);
     * iterator.forEach((value, index) =>
     * {
     *     console.log(`${index}: ${value}`); // "0: A", "1: M", "2: N", "3: Z"
     * }
     * ```
     *
     * @param iteratee The function to apply to each element of the iterator.
     */
    public forEach(iteratee: Iteratee<T>): void
    {
        let index = 0;

        while (true)
        {
            const result = this._iterator.next();
            if (result.done) { return; }

            iteratee(result.value, index);

            index += 1;
        }
    }

    /**
     * Advances the iterator to the next element and returns the result.  
     * If the iterator requires it, a value must be provided to be passed to the next element.
     *
     * Once the iterator is done, the method will return an object with the `done` property set to `true`.
     *
     * ```ts
     * const iterator = new SmartIterator<number>([1, 2, 3, 4, 5]);
     *
     * let result = iterator.next();
     * while (!result.done)
     * {
     *     console.log(result.value); // 1, 2, 3, 4, 5
     *
     *     result = iterator.next();
     * }
     *
     * console.log(result); // { done: true, value: undefined }
     * ```
     *
     * @param values The value to pass to the next element, if required.
     *
     * @returns The result of the iteration, containing the value of the operation.
     */
    public next(...values: N extends undefined ? [] : [N]): IteratorResult<T, R>
    {
        return this._iterator.next(...values);
    }

    /**
     * An utility method that may be used to close the iterator gracefully,
     * free the resources and perform any cleanup operation.  
     * It may also be used to signal the end or to compute a specific final result of the iteration process.
     *
     * ```ts
     * const iterator = new SmartIterator<number>({
     *     _index: 0,
     *     next: function()
     *     {
     *         return { done: false, value: this._index += 1 };
     *     },
     *     return: function() { console.log("Closing the iterator..."); }
     * });
     *
     * for (const value of iterator)
     * {
     *     if (value > 5) { break; } // Closing the iterator...
     *
     *     console.log(value); // 1, 2, 3, 4, 5
     * }
     * ```
     *
     * @param value The final value of the iterator.
     *
     * @returns The result of the iterator.
     */
    public return(value?: R): IteratorResult<T, R>
    {
        if (this._iterator.return) { return this._iterator.return(value); }

        return { done: true, value: value as R };
    }

    /**
     * An utility method that may be used to close the iterator due to an error,
     * free the resources and perform any cleanup operation.  
     * It may also be used to signal that an error occurred during the iteration process or to handle it.
     *
     * ```ts
     * const iterator = new SmartIterator<number>({
     *     _index: 0,
     *     next: function()
     *     {
     *         return { done: this._index > 10, value: this._index += 1 };
     *     },
     *     throw: function(error)
     *     {
     *         console.warn(error.message);
     *
     *         this._index = 0;
     *     }
     * });
     *
     * for (const value of iterator) // 1, 2, 3, 4, 5, "The index is too high.", 1, 2, 3, 4, 5, ...
     * {
     *     try
     *     {
     *         if (value > 5) { throw new Error("The index is too high."); }
     *
     *         console.log(value); // 1, 2, 3, 4, 5
     *     }
     *     catch (error) { iterator.throw(error); }
     * }
     * ```
     *
     * @param error The error to throw into the iterator.
     *
     * @returns The final result of the iterator.
     */
    public throw(error: unknown): IteratorResult<T, R>
    {
        if (this._iterator.throw) { return this._iterator.throw(error); }

        throw error;
    }

    /**
     * An utility method that aggregates the elements of the iterator using a given key function.  
     * The elements will be grouped by the resulting keys in a new specialized iterator.
     * See {@link AggregatedIterator}.
     *
     * Since the iterator is lazy, the grouping process will
     * be executed once the resulting iterator is materialized.
     *
     * A new iterator will be created, holding the reference to the original one.  
     * This means that the original iterator won't be consumed until the
     * the new one is and that consuming one of them will consume the other as well.
     *
     * ```ts
     * const iterator = new SmartIterator<number>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
     * const result = iterator.groupBy<string>((value) => value % 2 === 0 ? "even" : "odd");
     *
     * console.log(result.toObject()); // { odd: [1, 3, 5, 7, 9], even: [2, 4, 6, 8, 10] }
     * ```
     *
     * @template K The type of the keys used to group the elements.
     *
     * @param iteratee The key function to apply to each element of the iterator.
     *
     * @returns A new instance of the {@link AggregatedIterator} class containing the grouped elements.
     */
    public groupBy<K extends PropertyKey>(iteratee: Iteratee<T, K>): AggregatedIterator<K, T>
    {
        return new AggregatedIterator(this.map((element, index) =>
        {
            const key = iteratee(element, index);

            return [key, element] as [K, T];
        }));
    }

    /**
     * Materializes the iterator into an array.  
     * This method will consume the entire iterator in the process.
     *
     * If the iterator is infinite, the method will never return.
     *
     * ```ts
     * const iterator = new SmartIterator(function* ()
     * {
     *     for (let i = 0; i < 5; i += 1) { yield i; }
     * });
     * const result = iterator.toArray();
     *
     * console.log(result); // [0, 1, 2, 3, 4]
     * ```
     *
     * @returns The {@link Array} containing all elements of the iterator.
     */
    public toArray(): T[]
    {
        return Array.from(this as Iterable<T>);
    }

    public readonly [Symbol.toStringTag]: string = "SmartIterator";

    public [Symbol.iterator](): SmartIterator<T, R, N> { return this; }
}
