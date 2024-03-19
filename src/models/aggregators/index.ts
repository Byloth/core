import AggregatedIterator from "./aggregated-iterator.js";
import ReducedIterator from "./reduced-iterator.js";
import SmartIterator from "../smart-iterator.js";

import type { GeneratorFunction, Iteratee } from "../../types.js";

export default class Aggregator<T>
{
    protected _elements: SmartIterator<T>;

    public constructor(iterable: Iterable<T>);
    public constructor(iterator: Iterator<T>);
    public constructor(generatorFn: GeneratorFunction<T>);
    public constructor(argument: Iterable<T> | Iterator<T> | GeneratorFunction<T>);
    public constructor(argument: Iterable<T> | Iterator<T> | GeneratorFunction<T>)
    {
        this._elements = new SmartIterator(argument);
    }

    public filter(predicate: Iteratee<T, boolean>): Aggregator<T>
    {
        return new Aggregator(this._elements.filter(predicate));
    }
    public map<V>(iteratee: Iteratee<T, V>): Aggregator<V>
    {
        return new Aggregator(this._elements.map(iteratee));
    }

    public unique(): Aggregator<T>
    {
        return new Aggregator(this._elements.unique());
    }

    public byKey<K extends PropertyKey>(iteratee: Iteratee<T, K>): AggregatedIterator<K, T>
    {
        return new AggregatedIterator(this._elements.map((element, index) =>
        {
            const key = iteratee(element, index);

            return [key, element];
        }));
    }
}

export { AggregatedIterator, ReducedIterator };
