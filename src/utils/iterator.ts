import { SmartIterator } from "../models/index.js";

export function chain<T>(...iterables: Iterable<T>[]): SmartIterator<T>
{
    return new SmartIterator<T>(function* ()
    {
        for (const iterable of iterables)
        {
            for (const element of iterable) { yield element; }
        }
    });
}

export function count<T>(elements: Iterable<T>): number
{
    if (Array.isArray(elements)) { return elements.length; }

    let _count = 0;
    for (const _ of elements) { _count += 1; }

    return _count;
}

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

export function range(end: number): SmartIterator<number>;
export function range(start: number, end: number): SmartIterator<number>;
export function range(start: number, end: number, step: number): SmartIterator<number>;
export function range(start: number, end?: number, step = 1): SmartIterator<number>
{
    return new SmartIterator<number>(function* ()
    {
        if (end === undefined)
        {
            end = start;
            start = 0;
        }

        if (start > end) { step = step ?? -1; }

        for (let index = start; index < end; index += step) { yield index; }
    });
}

export function shuffle<T>(iterable: Iterable<T>): T[]
{
    const array = Array.from(iterable);

    for (let index = array.length - 1; index > 0; index -= 1)
    {
        const jndex = Math.floor(Math.random() * (index + 1));

        [array[index], array[jndex]] = [array[jndex], array[index]];
    }

    return array;
}

export function unique<T>(elements: Iterable<T>): SmartIterator<T>
{
    return new SmartIterator<T>(function* ()
    {
        const values = new Set<T>();

        for (const element of elements)
        {
            if (values.has(element)) { continue; }

            values.add(element);

            yield element;
        }
    });
}

export function zip<T, U>(first: Iterable<T>, second: Iterable<U>): SmartIterator<[T, U]>
{
    return new SmartIterator<[T, U]>(function* ()
    {
        const firstIterator = first[Symbol.iterator]();
        const secondIterator = second[Symbol.iterator]();

        while (true)
        {
            const firstResult = firstIterator.next();
            const secondResult = secondIterator.next();

            if ((firstResult.done) || (secondResult.done)) { break; }

            yield [firstResult.value, secondResult.value];
        }
    });
}
