import SmartIterator from "./smart-iterator.js";
import type { Iteratee } from "../types.js";

export function enumerate<T>(elements: Iterable<T>): SmartIterator<[number, T]>
{
    return new SmartIterator<[number, T]>(function* ()
    {
        let index = 0;

        for (const element of elements)
        {
            yield [index, element];

            index += 1;
        }
    });
}

export class AggregateIterator<T, K extends string | number | symbol>
{
    protected _elements: SmartIterator<T>;
    protected _iteratee: Iteratee<T, K>;

    public constructor(elements: SmartIterator<T>, iteratee: Iteratee<T, K>)
    {
        this._elements = elements;
        this._iteratee = iteratee;
    }

    public map<R>(iteratee: Iteratee<T, R>): AggregateIterator<R, K>
    {
        const elements = this._elements.map(iteratee);

        return new AggregateIterator<R, K>(elements, this._iteratee);
    }

    public toArray(): T[][]
    {
        return Array.from(this.toMap().values());
    }
    public toMap(): Map<K, T[]>
    {
        const groups = new Map<K, T[]>();

        for (const [index, element] of enumerate(this._elements))
        {
            const key = this._iteratee(element, index);
            const value = groups.get(key) ?? [];

            value.push(element);
            groups.set(key, value);
        }

        return groups;
    }
    public toObject(): Record<K, T[]>
    {
        const groups = {} as Record<K, T[]>;

        for (const [index, element] of enumerate(this._elements))
        {
            const key = this._iteratee(element, index);
            const value = groups[key] ?? [];

            value.push(element);
            groups[key] = value;
        }

        return groups;
    }
}

export default class Aggregator<T>
{
    protected _elements: SmartIterator<T>;

    public constructor(elements: SmartIterator<T>)
    {
        this._elements = elements;
    }

    public byKey<K extends string | number | symbol>(iteratee: Iteratee<T, K>): AggregateIterator<T, K>
    {
        return new AggregateIterator<T, K>(this._elements, iteratee);
    }
}
