import { ValueException } from "../exceptions/index.js";
import { SmartIterator } from "../iterators/index.js";
import type { GeneratorFunction } from "../iterators/types.js";

import type { KeyedIteratee, KeyedReducer, KeyedTypeGuardIteratee } from "./types.js";

export default class ReducedIterator<K extends PropertyKey, T>
{
    protected _elements: SmartIterator<[K, T]>;

    public constructor(iterable: Iterable<[K, T]>);
    public constructor(iterator: Iterator<[K, T]>);
    public constructor(generatorFn: GeneratorFunction<[K, T]>);
    public constructor(argument: Iterable<[K, T]> | Iterator<[K, T]> | GeneratorFunction<[K, T]>);
    public constructor(argument: Iterable<[K, T]> | Iterator<[K, T]> | GeneratorFunction<[K, T]>)
    {
        this._elements = new SmartIterator(argument);
    }

    public filter(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, T>;
    public filter<S extends T>(predicate: KeyedTypeGuardIteratee<K, T, S>): ReducedIterator<K, S>;
    public filter(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, T>
    {
        const elements = this._elements;

        return new ReducedIterator(function* ()
        {
            for (const [index, [key, element]] of elements.enumerate())
            {
                if (predicate(key, element, index))
                {
                    yield [key, element];
                }
            }
        });
    }
    public map<V>(iteratee: KeyedIteratee<K, T, V>): ReducedIterator<K, V>
    {
        const elements = this._elements;

        return new ReducedIterator(function* ()
        {
            for (const [index, [key, element]] of elements.enumerate())
            {
                yield [key, iteratee(key, element, index)];
            }
        });
    }
    public reduce(reducer: KeyedReducer<K, T, T>): T;
    public reduce<A>(reducer: KeyedReducer<K, T, A>, initialValue: A): A;
    public reduce<A>(reducer: KeyedReducer<K, T, A>, initialValue?: A): A
    {
        let index = 0;
        let accumulator: A;

        if (initialValue !== undefined)
        {
            accumulator = initialValue;
        }
        else
        {
            const firstElement = this._elements.next();
            if (firstElement.done)
            {
                throw new ValueException("Cannot reduce an empty iterator without an initial value.");
            }

            index += 1;
            accumulator = (firstElement.value[1] as unknown) as A;
        }

        for (const [key, element] of this._elements)
        {
            accumulator = reducer(key, accumulator, element, index);

            index += 1;
        }

        return accumulator;
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
    public items(): SmartIterator<[K, T]>
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
        return new Map(this.items());
    }
    public toObject(): Record<K, T>
    {
        return Object.fromEntries(this.items()) as Record<K, T>;
    }

    public get [Symbol.toStringTag]() { return "ReducedIterator"; }
}
