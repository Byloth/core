import type { GeneratorFunction, Iteratee, Reducer } from "../types.js";

export default class SmartIterator<T, R = void, N = undefined> implements Iterator<T, R, N>
{
    protected _iterator: Iterator<T, R, N>;

    public return?: (value?: R) => IteratorResult<T, R>;
    public throw?: (error?: unknown) => IteratorResult<T, R>;

    public constructor(iterable: Iterable<T>);
    public constructor(iterator: Iterator<T, R, N>);
    public constructor(generatorFn: GeneratorFunction<T, R, N>);
    public constructor(iterable: Iterable<T> | Iterator<T, R, N> | GeneratorFunction<T, R, N>)
    {
        if (iterable instanceof Function)
        {
            this._iterator = iterable();
        }
        else if (Symbol.iterator in iterable)
        {
            this._iterator = iterable[Symbol.iterator]() as Iterator<T, R, N>;
        }
        else
        {
            this._iterator = iterable;
        }

        if (this._iterator.return) { this.return = (value?: R) => this._iterator.return!(value); }
        if (this._iterator.throw) { this.throw = (error?: unknown) => this._iterator.throw!(error); }
    }

    public every(iteratee: Iteratee<T, boolean>): boolean
    {
        let index = 0;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = this._iterator.next();

            if (result.done) { return true; }
            if (!(iteratee(result.value, index))) { return false; }

            index += 1;
        }
    }
    public some(iteratee: Iteratee<T, boolean>): boolean
    {
        let index = 0;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = this._iterator.next();

            if (result.done) { return false; }
            if (iteratee(result.value, index)) { return true; }

            index += 1;
        }
    }

    public filter(iteratee: Iteratee<T, boolean>): SmartIterator<T, R, N>
    {
        let index = 0;
        const iterator = this._iterator;

        return new SmartIterator<T, R, N>({
            *[Symbol.iterator]()
            {
                while (true)
                {
                    const result = iterator.next();

                    if (result.done) { return result.value; }
                    if (iteratee(result.value, index)) { yield result.value; }

                    index += 1;
                }
            }
        });
    }
    public map<V>(iteratee: Iteratee<T, V>): SmartIterator<V, R>
    {
        let index = 0;
        const iterator = this._iterator;

        return new SmartIterator<V, R>({
            *[Symbol.iterator]()
            {
                while (true)
                {
                    const result = iterator.next();
                    if (result.done) { return result.value; }

                    yield iteratee(result.value, index);

                    index += 1;
                }
            }
        });
    }
    public reduce<A>(reducer: Reducer<T, A>, initialValue: A): A
    {
        let index = 0;
        let accumulator = initialValue;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = this._iterator.next();
            if (result.done) { return accumulator; }

            accumulator = reducer(accumulator, result.value, index);

            index += 1;
        }
    }

    public forEach(iteratee: Iteratee<T>): void
    {
        let index = 0;

        // eslint-disable-next-line no-constant-condition
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

    public toArray(): T[]
    {
        return [...this];
    }

    public [Symbol.iterator](): SmartIterator<T, R, N> { return this; }
}
