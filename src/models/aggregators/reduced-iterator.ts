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
    protected _elements: SmartIterator<[K, T]>;

    /**
     * Initializes a new instance of the {@link ReducedIterator} class.
     *
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
     * ```ts
     * const results = new SmartIterator<number[]>([-3, -1, 0, 2, 3, 5, 6, 8])
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
    public flatMap<V>(iteratee: KeyedIteratee<K, T, Iterable<V>>): AggregatedIterator<K, V>
    {
        const elements = this._elements.enumerate();

        return new AggregatedIterator(function* ()
        {
            for (const [index, [key, element]] of elements)
            {
                for (const value of iteratee(key, element, index)) { yield [key, value]; }
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
     * ```ts
     * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
     *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
     *     .reduce((key, accumulator, value) => accumulator.concat(value), () => [])
     *     .drop(2);
     *
     * console.log(results.toObject()); // { odd: [3, 5], even: [6, 8] }
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
     * Only the taken elements will be consumed in the process.  
     * The rest of the original iterator will ...
     */
    public take(count: number): ReducedIterator<K, T>
    {
        const elements = this._elements.enumerate();

        return new ReducedIterator(function* ()
        {
            for (const [index, [key, element]] of elements)
            {
                if (index >= count) { break; }

                yield [key, element];
            }
        });
    }

    public enumerate(): ReducedIterator<K, [number, T]>
    {
        return this.map((_, element, index) => [index, element]);
    }
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

    public count(): number
    {
        let index = 0;

        for (const _ of this._elements) { index += 1; }

        return index;
    }

    public forEach(iteratee: KeyedIteratee<K, T>): void
    {
        for (const [index, [key, element]] of this._elements.enumerate())
        {
            iteratee(key, element, index);
        }
    }

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
    public entries(): SmartIterator<[K, T]>
    {
        return this._elements;
    }
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

    public toArray(): T[]
    {
        return Array.from(this.values());
    }
    public toMap(): Map<K, T>
    {
        return new Map(this.entries());
    }
    public toObject(): Record<K, T>
    {
        return Object.fromEntries(this.entries()) as Record<K, T>;
    }

    public readonly [Symbol.toStringTag]: string = "ReducedIterator";
}
