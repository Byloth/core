import { ValueException } from "../exceptions/index.js";
import { SmartIterator } from "../iterators/index.js";
import type { GeneratorFunction } from "../iterators/types.js";

import AggregatedIterator from "./aggregated-iterator.js";
import type { KeyedIteratee, KeyedReducer, KeyedTypeGuardPredicate } from "./types.js";

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

    public every(predicate: KeyedIteratee<K, T, boolean>): boolean
    {
        for (const [index, [key, element]] of this._elements.enumerate())
        {
            if (!(predicate(key, element, index))) { return false; }
        }

        return true;
    }
    public some(predicate: KeyedIteratee<K, T, boolean>): boolean
    {
        for (const [index, [key, element]] of this._elements.enumerate())
        {
            if (predicate(key, element, index)) { return true; }
        }

        return false;
    }

    public filter(predicate: KeyedIteratee<K, T, boolean>): ReducedIterator<K, T>;
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
    public reduce(reducer: KeyedReducer<K, T, T>): T;
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

    public rekey<J extends PropertyKey>(iteratee: KeyedIteratee<K, T, J>): AggregatedIterator<J, T>
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

    public readonly [Symbol.toStringTag]: string = "ReducedIterator";
}
