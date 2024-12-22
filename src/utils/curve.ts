import { SmartIterator, ValueException } from "../models/index.js";

/**
 * A utility class that provides a set of methods to generate sequences of numbers following specific curves.  
 * It can be used to generate sequences of values that can be
 * used in animations, transitions and other different scenarios.
 *
 * It cannot be instantiated directly.
 */
export default class Curve
{
    /**
     * Generates a given number of values following a linear curve.  
     * The values are equally spaced and normalized between 0 and 1.
     *
     * ```ts
     * for (const value of Curve.Linear(5))
     * {
     *     console.log(value); // 0, 0.25, 0.5, 0.75, 1
     * }
     * ```
     *
     * ---
     *
     * @param values The number of values to generate.
     *
     * @returns A `SmartIterator` object that generates the values following a linear curve.
     */
    public static Linear(values: number): SmartIterator<number>
    {
        const steps = (values - 1);

        return new SmartIterator<number>(function* ()
        {
            for (let index = 0; index < values; index += 1) { yield index / steps; }
        });
    }

    /**
     * Generates a given number of values following an exponential curve.  
     * The values are equally spaced and normalized between 0 and 1.
     *
     * ```ts
     * for (const value of Curve.Exponential(6))
     * {
     *     console.log(value); // 0, 0.04, 0.16, 0.36, 0.64, 1
     * }
     * ```
     *
     * ---
     *
     * @param values The number of values to generate.
     * @param base
     * The base of the exponential curve. Default is `2`.
     *
     * Also note that:
     * - If it's equal to `1`, the curve will be linear.
     * - If it's included between `0` and `1`, the curve will be logarithmic.
     *
     * The base cannot be negative. If so, a `ValueException` will be thrown.
     *
     * @returns A `SmartIterator` object that generates the values following an exponential curve.
     */
    public static Exponential(values: number, base = 2): SmartIterator<number>
    {
        if (base < 0) { throw new ValueException("The base of the exponential curve cannot be negative."); }

        const steps = (values - 1);

        return new SmartIterator<number>(function* ()
        {
            for (let index = 0; index < values; index += 1) { yield Math.pow(index / steps, base); }
        });
    }

    private constructor() { /* ... */ }

    public readonly [Symbol.toStringTag]: string = "Curve";
}
