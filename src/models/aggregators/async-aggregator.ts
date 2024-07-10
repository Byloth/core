import AggregatedAsyncIterator from "./aggregated-async-iterator.js";

import { SmartAsyncIterator } from "../iterators/index.js";
import type {
    AsyncGeneratorFunction,
    GeneratorFunction,
    MaybeAsyncIterables,
    MaybeAsyncIteratee,
    MaybeAsyncTypeGuardIteratee

} from "../iterators/types.js";

export default class AsyncAggregator<T>
{
    protected _elements: SmartAsyncIterator<T>;

    public constructor(iterable: Iterable<T>);
    public constructor(iterable: AsyncIterable<T>);
    public constructor(iterator: Iterator<T>);
    public constructor(iterator: AsyncIterator<T>);
    public constructor(generatorFn: GeneratorFunction<T>);
    public constructor(generatorFn: AsyncGeneratorFunction<T>);
    public constructor(argument: MaybeAsyncIterables<T>);
    public constructor(argument: MaybeAsyncIterables<T>)
    {
        this._elements = new SmartAsyncIterator(argument);
    }

    public filter(predicate: MaybeAsyncIteratee<T, boolean>): AsyncAggregator<T>;
    public filter<S extends T>(predicate: MaybeAsyncTypeGuardIteratee<T, S>): AsyncAggregator<S>;
    public filter(predicate: MaybeAsyncIteratee<T, boolean>): AsyncAggregator<T>
    {
        return new AsyncAggregator(this._elements.filter(predicate));
    }
    public map<V>(iteratee: MaybeAsyncIteratee<T, V>): AsyncAggregator<V>
    {
        return new AsyncAggregator(this._elements.map(iteratee));
    }

    public unique(): AsyncAggregator<T>
    {
        return new AsyncAggregator(this._elements.unique());
    }

    public groupBy<K extends PropertyKey>(iteratee: MaybeAsyncIteratee<T, K>): AggregatedAsyncIterator<K, T>
    {
        return new AggregatedAsyncIterator(this._elements.map(async (element, index) =>
        {
            const key = await iteratee(element, index);

            return [key, element] as [K, T];
        }));
    }

    public get [Symbol.toStringTag]() { return "AsyncAggregator"; }
}
