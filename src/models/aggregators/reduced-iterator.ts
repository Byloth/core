import SmartIterator from "../smart-iterator.js";

import type { KeyIteratee } from "./types.js";
import type { GeneratorFunction } from "../../types.js";

export default class ReducedIterator<T, K extends PropertyKey>
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

    public filter(predicate: KeyIteratee<T, K, boolean>): ReducedIterator<T, K>
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
    public map<V>(iteratee: KeyIteratee<T, K, V>): ReducedIterator<V, K>
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

    public toArray(): T[]
    {
        return Array.from(this.toMap().values());
    }
    public toMap(): Map<K, T>
    {
        return new Map(this._elements.toArray());
    }
    public toObject(): Record<K, T>
    {
        return Object.fromEntries(this._elements.toArray()) as Record<K, T>;
    }
}
