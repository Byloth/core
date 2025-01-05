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

export default class AggregatedAsyncIterator<K extends PropertyKey, T>
{
    protected _elements: SmartAsyncIterator<[K, T]>;

    public constructor(iterable: Iterable<[K, T]>);
    public constructor(iterable: AsyncIterable<[K, T]>);
    public constructor(iterator: Iterator<[K, T]>);
    public constructor(iterator: AsyncIterator<[K, T]>);
    public constructor(generatorFn: GeneratorFunction<[K, T]>);
    public constructor(generatorFn: AsyncGeneratorFunction<[K, T]>);
    public constructor(argument: MaybeAsyncIteratorLike<[K, T]> | MaybeAsyncGeneratorFunction<[K, T]>);
    public constructor(argument: MaybeAsyncIteratorLike<[K, T]> | MaybeAsyncGeneratorFunction<[K, T]>)
    {
        this._elements = new SmartAsyncIterator(argument);
    }

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

    public filter(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): AggregatedAsyncIterator<K, T>;
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
    public async reduce(reducer: MaybeAsyncKeyedReducer<K, T, T>): Promise<ReducedIterator<K, T>>;
    public async reduce<A>(reducer: MaybeAsyncKeyedReducer<K, T, A>, initialValue: (key: K) => MaybePromise<A>)
        : Promise<ReducedIterator<K, A>>;
    public async reduce<A>(reducer: MaybeAsyncKeyedReducer<K, T, A>, initialValue?: (key: K) => MaybePromise<A>)
        : Promise<ReducedIterator<K, A>>
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
                accumulator = await initialValue(key);
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

    public async find(predicate: MaybeAsyncKeyedIteratee<K, T, boolean>): Promise<ReducedIterator<K, T | undefined>>;
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
            for (const [key, count] of counters) { yield [key, count]; }
        });
    }

    public async forEach(iteratee: MaybeAsyncKeyedIteratee<K, T>): Promise<void>
    {
        const indexes = new Map<K, number>();

        for await (const [key, element] of this._elements)
        {
            const index = indexes.get(key) ?? 0;

            iteratee(key, element, index);

            indexes.set(key, index + 1);
        }
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
            for await (const [_, element] of elements) { yield element; }
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

    public readonly [Symbol.toStringTag]: string = "AggregatedAsyncIterator";
}
