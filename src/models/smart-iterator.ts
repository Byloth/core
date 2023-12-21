import type { GeneratorFunction } from "../types.js";

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

    public filter(callback: (value: T, index: number) => boolean): SmartIterator<T, R, N>
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

                    if (callback(result.value, index))
                    {
                        yield result.value;
                    }

                    index += 1;
                }
            }
        });
    }
    public map<V>(callback: (value: T, index: number) => V): SmartIterator<V, R>
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

                    yield callback(result.value, index);

                    index += 1;
                }
            }
        });
    }
    public reduce<U>(callback: (accumulator: U, value: T, index: number) => U, initialValue: U): U
    {
        let index = 0;
        let accumulator = initialValue;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = this._iterator.next();
            if (result.done) { return accumulator; }

            accumulator = callback(accumulator, result.value, index);

            index += 1;
        }
    }

    public forEach(callback: (value: T, index: number) => void): void
    {
        let index = 0;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = this._iterator.next();
            if (result.done) { return; }

            callback(result.value, index);

            index += 1;
        }
    }

    public next(...values: N extends undefined ? [] : [N]): IteratorResult<T, R>
    {
        return this._iterator.next(...values);
    }

    public [Symbol.iterator](): SmartIterator<T, R, N> { return this; }
}
