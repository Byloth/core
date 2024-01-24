import { zip } from "./iterator.js";

export function average<T extends number>(values: Iterable<T>): number;
export function average<T extends number>(values: Iterable<T>, weights: Iterable<number>): number;
export function average<T extends number>(values: Iterable<T>, weights?: Iterable<number>): number
{
    if (weights === undefined)
    {
        let _sum = 0;
        let _count = 0;

        for (const value of values)
        {
            _sum += value;
            _count += 1;
        }

        return _sum / _count;
    }

    let _sum = 0;
    let _count = 0;

    for (const [value, weight] of zip(values, weights))
    {
        _sum += value * weight;
        _count += weight;
    }

    return _sum / _count;
}

export function hash(value: string): number
{
    let hashedValue = 0;
    for (let index = 0; index < value.length; index += 1)
    {
        const char = value.charCodeAt(index);

        hashedValue = ((hashedValue << 5) - hashedValue) + char;
        hashedValue |= 0;
    }

    return hashedValue;
}

export function sum<T extends number>(values: Iterable<T>): number
{
    let _sum = 0;
    for (const value of values) { _sum += value; }

    return _sum;
}
