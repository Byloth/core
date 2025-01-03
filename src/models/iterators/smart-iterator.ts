import AggregatedIterator from "../aggregators/aggregated-iterator.js";
import { ValueException } from "../exceptions/index.js";

import type { GeneratorFunction, Iteratee, TypeGuardIteratee, Reducer, IteratorLike } from "./types.js";

export default class SmartIterator<T, R = void, N = undefined> implements Iterator<T, R, N>
{
    protected _iterator: Iterator<T, R, N>;

    public return?: (value?: R) => IteratorResult<T, R>;
    public throw?: (error?: unknown) => IteratorResult<T, R>;

    public constructor(iterable: Iterable<T, R, N>);
    public constructor(iterator: Iterator<T, R, N>);
    public constructor(generatorFn: GeneratorFunction<T, R, N>);
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

        if (this._iterator.return) { this.return = (value) => this._iterator.return!(value); }
        if (this._iterator.throw) { this.throw = (error) => this._iterator.throw!(error); }
    }

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
