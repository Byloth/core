import AggregatedIterator from "../aggregators/aggregated-iterator.js";
import { ValueException } from "../exceptions/index.js";

import type { GeneratorFunction, Iteratee, TypeGuardIteratee, Reducer, IteratorLike } from "./types.js";

/**
 * A wrapper class representing an enhanced & instantiable version
 * of the native {@link Iterable} & {@link Iterator} interfaces.
 *
 * It provides a set of utility methods to better manipulate and
 * transform iterators in a functional and highly performant way.  
 * It takes inspiration from the native {@link Array} methods like `map`, `filter`, `reduce`, etc...
 *
 * @template T The type of elements in the iterator.
 * @template R The type of the final result of the iterator. Default is `void`.
 * @template N The type of the argument required by the `next` method. Default is `undefined`.
 */
export default class SmartIterator<T, R = void, N = undefined> implements Iterator<T, R, N>
{
    /**
     * The native {@link Iterator} object that is wrapped by this instance.
     */
    protected _iterator: Iterator<T, R, N>;

    /**
     * Initializes a new instance of the {@link SmartIterator} class.
     *
     * ```ts
     * const iterator = new SmartIterator<string>(["A", "B", "C"]);
     * ```
     *
     * ---
     *
     * @param iterable The iterable to wrap.
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
     * ---
     *
     * @param iterator The iterator to wrap.
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
     * ---
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
     * ---
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
     * Determines whether all the elements of the iterator satisfy a condition.
     *
     * Also note that:
     * - The iterator will be consumed entirely in the process.  
     * - If the iterator is infinite, the function will never return.
     *
     * ```ts
     * const iterator = new SmartIterator<number>([1, 2, 3, 4, 5]);
     * const result = iterator.every((value) => value > 0);
     *
     * console.log(result); // true
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
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
     * Determines whether any element of the iterator satisfies a condition.
     *
     * Also note that:
     * - The iterator will be consumed entirely in the process.  
     * - If the iterator is infinite, the function will never return.
     *
     * ```ts
     * const iterator = new SmartIterator<number>([1, 2, 3, 4, 5]);
     * const result = iterator.some((value) => value > 3);
     *
     * console.log(result); // true
     * ```
     *
     * ---
     *
     * @param predicate The condition to check for each element of the iterator.
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

    public filter(predicate: Iteratee<T, boolean>): SmartIterator<T, R>;
    public filter<S extends T>(predicate: TypeGuardIteratee<T, S>): SmartIterator<S, R>;
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
    public reduce(reducer: Reducer<T, T>): T;
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

    public flatMap<V>(iteratee: Iteratee<T, Iterable<V>>): SmartIterator<V, R>
    {
        const iterator = this._iterator;

        return new SmartIterator<V, R>(function* ()
        {
            let index = 0;

            while (true)
            {
                const result = iterator.next();
                if (result.done) { return result.value; }

                const iterable = iteratee(result.value, index);
                for (const value of iterable)
                {
                    yield value;
                }

                index += 1;
            }
        });
    }

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

    public find(predicate: Iteratee<T, boolean>): T | undefined;
    public find<S extends T>(predicate: TypeGuardIteratee<T, S>): S | undefined;
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

    public enumerate(): SmartIterator<[number, T], R>
    {
        return this.map((value, index) => [index, value]);
    }
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

    public next(...values: N extends undefined ? [] : [N]): IteratorResult<T, R>
    {
        return this._iterator.next(...values);
    }
    public return(value?: R): IteratorResult<T, R>
    {
        if (this._iterator.return) { return this._iterator.return(value); }

        return { done: true, value: value as R };
    }
    public throw(error: unknown): IteratorResult<T, R>
    {
        if (this._iterator.throw) { return this._iterator.throw(error); }

        throw error;
    }

    public groupBy<K extends PropertyKey>(iteratee: Iteratee<T, K>): AggregatedIterator<K, T>
    {
        return new AggregatedIterator(this.map((element, index) =>
        {
            const key = iteratee(element, index);

            return [key, element] as [K, T];
        }));
    }

    public toArray(): T[]
    {
        return Array.from(this as Iterable<T>);
    }

    public readonly [Symbol.toStringTag]: string = "SmartIterator";

    public [Symbol.iterator](): SmartIterator<T, R, N> { return this; }
}
