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
    for (let i = 0; i < value.length; i++)
    {
        const char = value.charCodeAt(i);
        hashedValue = ((hashedValue << 5) - hashedValue) + char;
        hashedValue |= 0;
    }

    return hashedValue;
}

export function random(): number;
export function random(max: number): number;
export function random(min: number, max: number): number;
export function random(min: number, max: number, isDecimal: boolean): number;
export function random(min: number, max: number, digits: number): number;
export function random(min: number = 1, max?: number, decimals?: boolean | number): number
{
    if (max === undefined)
    {
        max = min;
        min = 0;
    }

    if (min === max)
    {
        return min;
    }

    let rounder: (value: number) => number;

    if (decimals === true)
    {
        rounder = (value) => value;
    }
    else if (decimals === undefined)
    {
        if (Math.abs(max - min) <= 1)
        {
            rounder = (value) => value;
        }
        else
        {
            rounder = Math.floor;
        }
    }
    else if (decimals === false)
    {
        rounder = Math.floor;
    }
    else
    {
        const digits = 10 ** decimals;

        rounder = (value) => Math.floor(value * digits) / digits;
    }

    return rounder(Math.random() * (max - min) + min);
}

export function sum<T extends number>(values: Iterable<T>): number
{
    let _sum = 0;
    for (const value of values) { _sum += value; }

    return _sum;
}
