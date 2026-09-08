import { ValueException } from "../models/exceptions/index.js";
import { zip } from "./iterator.js";

/**
 * Computes the average of a given list of values.  
 * The values can be weighted using an additional list of weights.
 *
 * ---
 *
 * @example
 * ```ts
 * average([1, 2, 3, 4, 5]);        // 3
 * average([6, 8.5, 4], [3, 2, 1]); // 6.5
 * ```
 *
 * ---
 *
 * @template T The type of the values in the list. It must be or extend a `number` object.
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
    if (_count <= 0) { throw new ValueException("The sum of weights must be greater than zero."); }

    return _sum / _count;
}

/**
 * Clamps a given value between a minimum and a maximum bound.
 *
 * ---
 *
 * @example
 * ```ts
 * clamp(5, 0, 10);  // 5
 * clamp(-3, 0, 10); // 0
 * clamp(15, 0, 10); // 10
 * ```
 *
 * ---
 *
 * @param value The value to clamp.
 * @param min The minimum bound.
 * @param max The maximum bound.
 *
 * @returns The clamped value between the specified bounds.
 */
export function clamp(value: number, min: number, max: number): number
{
    if (min > max)
    {
        throw new ValueException("The minimum bound must be less than or equal to the maximum bound.");
    }

    if (value < min) { return min; }
    if (value > max) { return max; }

    return value;
}

/**
 * Linearly interpolates between two values.
 *
 * Also note that:
 * - The ratio isn't clamped: values outside `[0, 1]` extrapolate beyond the two bounds.
 *
 * ---
 *
 * @example
 * ```ts
 * lerp(0, 10, 0.5); // 5
 * lerp(0, 10, 2);   // 20
 * lerp(10, 0, 0.25); // 7.5
 * ```
 *
 * ---
 *
 * @param from The value returned when `ratio` is `0`.
 * @param to The value returned when `ratio` is `1`.
 * @param ratio The interpolation ratio.
 *
 * @returns The interpolated value.
 */
export function lerp(from: number, to: number, ratio: number): number
{
    return (from + ((to - from) * ratio));
}

/**
 * Performs a smooth Hermite interpolation between `0` and `1` as `value` moves from `min` to `max`.
 *
 * It's the same function as GLSL's `smoothstep`: the value is normalized within the two bounds,
 * clamped to `[0, 1]` and then eased with the cubic `t * t * (3 - 2 * t)`.
 *
 * Also note that:
 * - Values below `min` return `0` and values above `max` return `1`.
 * - The minimum bound must be less than the maximum bound. Otherwise, a {@link ValueException} will be thrown.
 *
 * ---
 *
 * @example
 * ```ts
 * smoothstep(0, 1, 0.25); // 0.15625
 * smoothstep(0, 1, 0.5);  // 0.5
 * smoothstep(10, 20, 25); // 1
 * ```
 *
 * ---
 *
 * @param min The lower bound, where the result starts rising from `0`.
 * @param max The upper bound, where the result reaches `1`.
 * @param value The value to interpolate.
 *
 * @returns A number in the `[0, 1]` range.
 */
export function smoothstep(min: number, max: number, value: number): number
{
    if (min >= max) { throw new ValueException("The minimum bound must be less than the maximum bound."); }

    const ratio = clamp((value - min) / (max - min), 0, 1);
    return ((ratio * ratio) * (3 - (2 * ratio)));
}

/**
 * Sums all the values of a given list.
 *
 * ---
 *
 * @example
 * ```ts
 * sum([1, 2, 3, 4, 5]); // 15
 * ```
 *
 * ---
 *
 * @template T The type of the values in the list. It must be or extend a `number` object.
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
