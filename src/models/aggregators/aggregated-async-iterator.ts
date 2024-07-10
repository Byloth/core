import { SmartAsyncIterator } from "../iterators/index.js";
import type { AsyncGeneratorFunction, GeneratorFunction, MaybeAsyncIterables } from "../iterators/types.js";
import type { MaybePromise } from "../types.js";

import ReducedIterator from "./reduced-iterator.js";
import type { MaybeAsyncKeyIteratee, MaybeAsyncKeyTypeGuardIteratee, MaybeAsyncKeyReducer } from "./types.js";

export default class AggregatedAsyncIterator<K extends PropertyKey, T>
{
    protected _elements: SmartAsyncIterator<[K, T]>;

    public constructor(iterable: Iterable<[K, T]>);
    public constructor(iterable: AsyncIterable<[K, T]>);
    public constructor(iterator: Iterator<[K, T]>);
    public constructor(iterator: AsyncIterator<[K, T]>);
    public constructor(generatorFn: GeneratorFunction<[K, T]>);
    public constructor(generatorFn: AsyncGeneratorFunction<[K, T]>);
    public constructor(argument: MaybeAsyncIterables<[K, T]>);
    public constructor(argument: MaybeAsyncIterables<[K, T]>)
    {
        this._elements = new SmartAsyncIterator(argument);
    }

    public async every(predicate: MaybeAsyncKeyIteratee<K, T, boolean>): Promise<ReducedIterator<K, boolean>>
    {
        const indexes = new Map<K, [number, boolean]>();

        for await (const [key, element] of this._elements)
        {
            const [index, result] = indexes.get(key) ?? [0, true];

            if (!(result)) { continue; }

            indexes.set(key, [index + 1, await predicate(key, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, result]] of indexes)
            {
                yield [key, result];
            }
        });
    }
    public async some(predicate: MaybeAsyncKeyIteratee<K, T, boolean>): Promise<ReducedIterator<K, boolean>>
    {
        const indexes = new Map<K, [number, boolean]>();

        for await (const [key, element] of this._elements)
        {
            const [index, result] = indexes.get(key) ?? [0, false];

            if (result) { continue; }

            indexes.set(key, [index + 1, await predicate(key, element, index)]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, result]] of indexes)
            {
                yield [key, result];
            }
        });
    }

    public filter(predicate: MaybeAsyncKeyIteratee<K, T, boolean>): AggregatedAsyncIterator<K, T>;
    public filter<S extends T>(predicate: MaybeAsyncKeyTypeGuardIteratee<K, T, S>): AggregatedAsyncIterator<K, S>;
    public filter(predicate: MaybeAsyncKeyIteratee<K, T, boolean>): AggregatedAsyncIterator<K, T>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[K, T]>
        {
            const indexes = new Map<K, number>();

            for await (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                indexes.set(key, index + 1);

                if (await predicate(key, element, index)) { yield [key, element]; }
            }
        });
    }
    public map<V>(iteratee: MaybeAsyncKeyIteratee<K, T, V>): AggregatedAsyncIterator<K, V>
    {
        const elements = this._elements;

        return new AggregatedAsyncIterator(async function* (): AsyncGenerator<[K, V]>
        {
            const indexes = new Map<K, number>();

            for await (const [key, element] of elements)
            {
                const index = indexes.get(key) ?? 0;

                indexes.set(key, index + 1);

                yield [key, await iteratee(key, element, index)];
            }
        });
    }
    public async reduce(reducer: MaybeAsyncKeyReducer<K, T, T>): Promise<ReducedIterator<K, T>>;
    public async reduce<A>(reducer: MaybeAsyncKeyReducer<K, T, A>, initialValue: (key: K) => MaybePromise<A>)
        : Promise<ReducedIterator<K, A>>;
    public async reduce<A>(reducer: MaybeAsyncKeyReducer<K, T, A>, initialValue?: (key: K) => MaybePromise<A>)
        : Promise<ReducedIterator<K, A>>
    {
        const accumulators = new Map<K, [number, A]>();

        for await (const [key, element] of this._elements)
        {
            let index: number;
            let accumulator: A;

            if (accumulators.has(key))
            {
                [index, accumulator] = accumulators.get(key)!;

                index += 1;
            }
            else if (initialValue !== undefined)
            {
                index = 0;
                accumulator = await initialValue(key);
            }
            else
            {
                accumulators.set(key, [0, (element as unknown) as A]);

                continue;
            }

            accumulator = await reducer(key, accumulator, element, index);

            accumulators.set(key, [index, accumulator]);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, [_, accumulator]] of accumulators)
            {
                yield [key, accumulator];
            }
        });
    }

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
            for (const [key, count] of counters)
            {
                yield [key, count];
            }
        });
    }
    public async first(): Promise<ReducedIterator<K, T>>
    {
        const firsts = new Map<K, T>();

        for await (const [key, element] of this._elements)
        {
            if (firsts.has(key)) { continue; }

            firsts.set(key, element);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, element] of firsts)
            {
                yield [key, element];
            }
        });
    }
    public async last(): Promise<ReducedIterator<K, T>>
    {
        const lasts = new Map<K, T>();

        for await (const [key, element] of this._elements)
        {
            lasts.set(key, element);
        }

        return new ReducedIterator(function* ()
        {
            for (const [key, element] of lasts)
            {
                yield [key, element];
            }
        });
    }

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
    public items(): SmartAsyncIterator<[K, T]>
    {
        return this._elements;
    }
    public values(): SmartAsyncIterator<T>
    {
        const elements = this._elements;

        return new SmartAsyncIterator<T>(async function* ()
        {
            for await (const [_, element] of elements)
            {
                yield element;
            }
        });
    }

    public async toArray(): Promise<T[][]>
    {
        const map = await this.toMap();

        return Array.from(map.values());
    }
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

    public get [Symbol.toStringTag]() { return "AggregatedAsyncIterator"; }
}
