export function count<T>(elements: Iterable<T>): number
{
    if ("length" in elements) { return elements.length as number; }

    let _count = 0;
    for (const _ of elements) { _count += 1; }

    return _count;
}

export function* range(start: number, end: number, step?: number): Iterable<number>
{
    if (start > end) { step = step ?? -1; }
    else { step = step ?? 1; }

    for (let i = start; i < end; i += step) { yield i; }
}

export function sum<T extends number>(elements: Iterable<T>): number
{
    let _sum = 0;
    for (const value of elements) { _sum += value; }

    return _sum;
}

export function unique<T>(elements: Iterable<T>): T[]
{
    return [...new Set(elements)];
}
