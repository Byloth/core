import { ValueException } from "../exceptions/index.js";

import type {
    AsyncGeneratorFunction,
    GeneratorFunction,
    MaybeAsyncIteratee,
    MaybeAsyncReducer,
    MaybeAsyncIterLike,
    MaybeAsyncTypeGuardIteratee

} from "./types.js";

export default class SmartAsyncIterator<T, R = void, N = undefined> implements AsyncIterator<T, R, N>
{
    protected _iterator: AsyncIterator<T, R, N>;

    public return?: (value?: R) => Promise<IteratorResult<T, R>>;
    public throw?: (error?: unknown) => Promise<IteratorResult<T, R>>;

    public constructor(iterable: Iterable<T>);
    public constructor(iterable: AsyncIterable<T>);
    public constructor(iterator: Iterator<T, R, N>);
    public constructor(iterator: AsyncIterator<T, R, N>);
    public constructor(generatorFn: GeneratorFunction<T, R, N>);
    public constructor(generatorFn: AsyncGeneratorFunction<T, R, N>);
    public constructor(argument: MaybeAsyncIterLike<T, R, N>);
    public constructor(argument: MaybeAsyncIterLike<T, R, N>)
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

        if (this._iterator.return) { this.return = (value?: R) => this._iterator.return!(value); }
        if (this._iterator.throw) { this.throw = (error?: unknown) => this._iterator.throw!(error); }
    }

    public async every(predicate: MaybeAsyncIteratee<T, boolean>): Promise<boolean>
    {
        let index = 0;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = await this._iterator.next();

            if (result.done) { return true; }
            if (!(predicate(result.value, index))) { return false; }

            index += 1;
        }
    }
    public async some(predicate: MaybeAsyncIteratee<T, boolean>): Promise<boolean>
    {
        let index = 0;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = await this._iterator.next();

            if (result.done) { return false; }
            if (predicate(result.value, index)) { return true; }

            index += 1;
        }
    }

    public filter(predicate: MaybeAsyncIteratee<T, boolean>): SmartAsyncIterator<T, R>;
    public filter<S extends T>(predicate: MaybeAsyncTypeGuardIteratee<T, S>): SmartAsyncIterator<S, R>;
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
                if (predicate(result.value, index)) { yield result.value; }

                index += 1;
            }
        });
    }
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

                yield iteratee(result.value, index);

                index += 1;
            }
        });
    }
    public async reduce(reducer: MaybeAsyncReducer<T, T>): Promise<T>;
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

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = await this._iterator.next();
            if (result.done) { return accumulator; }

            accumulator = await reducer(accumulator, result.value, index);

            index += 1;
        }
    }

    public enumerate(): SmartAsyncIterator<[number, T], R>
    {
        return this.map((value, index) => [index, value]);
    }
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

    public async count(): Promise<number>
    {
        let index = 0;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = await this._iterator.next();
            if (result.done) { return index; }

            index += 1;
        }
    }
    public async forEach(iteratee: MaybeAsyncIteratee<T>): Promise<void>
    {
        let index = 0;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = await this._iterator.next();
            if (result.done) { return; }

            await iteratee(result.value, index);

            index += 1;
        }
    }

    public next(...values: N extends undefined ? [] : [N]): Promise<IteratorResult<T, R>>
    {
        return this._iterator.next(...values);
    }

    public async toArray(): Promise<T[]>
    {
        const elements: T[] = [];

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            const result = await this._iterator.next();
            if (result.done) { return elements; }

            elements.push(result.value);
        }
    }

    public get [Symbol.toStringTag]() { return "SmartAsyncIterator"; }

    public [Symbol.asyncIterator](): SmartAsyncIterator<T, R, N> { return this; }
}
