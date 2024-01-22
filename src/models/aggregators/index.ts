import AggregateIterator from "./aggregate-iterator.js";
import ReducedIterator from "./reduced-iterator.js";
import SmartIterator from "../smart-iterator.js";

import type { Iteratee } from "../../types.js";

export default class Aggregator<T>
{
    protected _elements: SmartIterator<T>;

    public constructor(elements: SmartIterator<T>)
    {
        this._elements = elements;
    }

    public byKey<K extends PropertyKey>(iteratee: Iteratee<T, K>): AggregateIterator<T, K>
    {
        const elements = this._elements;

        return new AggregateIterator(function* ()
        {
            for (const [index, element] of elements.enumerate())
            {
                const key = iteratee(element, index);

                yield [key, element];
            }
        });
    }
}

export { AggregateIterator, ReducedIterator };
