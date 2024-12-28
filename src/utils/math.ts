import { ValueException } from "../models/exceptions/index.js";
import { zip } from "./iterator.js";

/**
 * Computes the average of a given list of values.  
 * The values can be weighted using an additional list of weights.
 *
 * ```ts
 * average([1, 2, 3, 4, 5]); // 3
 * average([6, 8.5, 4], [3, 2, 1]); // 6.5
 * ```
 *
 * ---
 *
 * @param values
 * The list of values to compute the average.
 * 
 * It must contain at least one element. Otherwise, a {@link ValueException} will be thrown.
 *
 * @param weights
 * The list of weights to apply to the values.  
 * It should contain the same number of elements as the values list or
 * the smaller number of elements between the two lists will be considered.
 *
 * The sum of the weights must be greater than zero. Otherwise, a {@link ValueException} will be thrown.
 *
 * @returns The average of the specified values.
 */
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

/**
 * An utility function to compute the hash of a given string.
 *
 * The hash is computed using a simple variation of the
 * {@link http://www.cse.yorku.ca/~oz/hash.html#djb2|djb2} algorithm.  
 * However, the hash is garanteed to be a 32-bit signed integer.
 *
 * ```ts
 * hash("Hello, world!"); // -1880044555
 * hash("How are you?"); // 1761539132
 * ```
 *
 * ---
 *
 * @param value The string to hash.
 *
 * @returns The hash of the specified string.
 */
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

/**
 * Sums all the values of a given list.
 *
 * ```ts
 * sum([1, 2, 3, 4, 5]); // 15
 * ```
 *
 * ---
 *
 * @param values The list of values to sum.
 *
 * @returns The sum of the specified values.
 */
export function sum<T extends number>(values: Iterable<T>): number
{
    let _sum = 0;
    for (const value of values) { _sum += value; }

    return _sum;
}
