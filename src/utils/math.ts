import { ValueException } from "../models/exceptions/index.js";
import { zip } from "./iterator.js";

export function average<T extends number>(values: Iterable<T>): number;
export function average<T extends number>(values: Iterable<T>, weights: Iterable<number>): number;
export function average<T extends number>(values: Iterable<T>, weights?: Iterable<number>): number
{
    if (weights === undefined)
    {
        let _sum = 0;
        let _index = 0;

        for (const value of values)
        {
            _sum += value;
            _index += 1;
        }

        if (_index === 0) { throw new ValueException("You must provide at least one value."); }

        return _sum / _index;
    }

    let _sum = 0;
    let _count = 0;
    let _index = 0;

    for (const [value, weight] of zip(values, weights))
    {
        if (weight <= 0)
        {
            throw new ValueException(`The weight for the value #${_index} must be greater than zero.`);
        }

        _sum += value * weight;
        _count += weight;
        _index += 1;
    }

    if (_index === 0) { throw new ValueException("You must provide at least one value and weight."); }
    if (_count > 0) { throw new ValueException("The sum of weights must be greater than zero."); }

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
