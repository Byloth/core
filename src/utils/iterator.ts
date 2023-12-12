export function count<T>(elements: Iterable<T>): number
{
    if (Array.isArray(elements)) { return elements.length; }

    let _count = 0;
    for (const _ of elements) { _count += 1; }

    return _count;
}

export function range(end: number): Generator<number, void>;
export function range(start: number, end: number): Generator<number, void>;
export function range(start: number, end: number, step: number): Generator<number, void>;
export function* range(start: number, end?: number, step = 1): Generator<number, void>
{
    if (end === undefined)
    {
        end = start;
        start = 0;
    }

    if (start > end) { step = step ?? -1; }

    for (let index = start; index < end; index += step) { yield index; }
}

export function shuffle<T>(iterable: Iterable<T>): T[]
{
    const array = [...iterable];

    for (let index = array.length - 1; index > 0; index -= 1)
    {
        const jndex = Math.floor(Math.random() * (index + 1));

        [array[index], array[jndex]] = [array[jndex], array[index]];
    }

    return array;
}

export function unique<T>(elements: Iterable<T>): T[]
{
    return [...new Set(elements)];
}

export function* zip<T, U>(first: Iterable<T>, second: Iterable<U>): Generator<[T, U], void>
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
}
