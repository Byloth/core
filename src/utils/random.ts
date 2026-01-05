import { ValueException } from "../models/index.js";

/**
 * A wrapper class around the native {@link Math.random} function that
 * provides a set of methods to generate random values more easily.  
 * It can be used to generate random numbers, booleans and other different values.
 *
 * It cannot be instantiated directly.
 */
export default class Random
{
    /**
     * Generates a random boolean value.
     *
     * ---
     *
     * @example
     * ```ts
     * if (Random.Boolean())
     * {
     *    // Do something...
     * }
     * ```
     *
     * ---
     *
     * @param ratio
     * The probability of generating `true`.
     *
     * It must be included between `0` and `1`. Default is `0.5`.
     *
     * @returns A random boolean value.
     */
    public static Boolean(ratio = 0.5): boolean
    {
        return (Math.random() < ratio);
    }

    /**
     * Generates a random integer value between `0` (included) and `max` (excluded).
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Integer(5); // 0, 1, 2, 3, 4
     * ```
     *
     * ---
     *
     * @param max The maximum value (excluded).
     *
     * @returns A random integer value.
     */
    public static Integer(max: number): number;

    /**
     * Generates a random integer value between `min` (included) and `max` (excluded).
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Integer(2, 7); // 2, 3, 4, 5, 6
     * ```
     *
     * ---
     *
     * @param min The minimum value (included).
     * @param max The maximum value (excluded).
     *
     * @returns A random integer value.
     */
    public static Integer(min: number, max: number): number;
    public static Integer(min: number, max?: number): number
    {
        if (max === undefined) { return Math.floor(Math.random() * min); }

        return Math.floor(Math.random() * (max - min) + min);
    }

    /**
     * Generates a random decimal value between `0` (included) and `1` (excluded).
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Decimal(); // 0.123456789
     * ```
     *
     * ---
     *
     * @returns A random decimal value.
     */
    public static Decimal(): number;

    /**
     * Generates a random decimal value between `0` (included) and `max` (excluded).
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Decimal(5); // 2.3456789
     * ```
     *
     * ---
     *
     * @param max The maximum value (excluded).
     *
     * @returns A random decimal value.
     */
    public static Decimal(max: number): number;

    /**
     * Generates a random decimal value between `min` (included) and `max` (excluded).
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Decimal(2, 7); // 4.56789
     * ```
     *
     * ---
     *
     * @param min The minimum value (included).
     * @param max The maximum value (excluded).
     *
     * @returns A random decimal value
     */
    public static Decimal(min: number, max: number): number;
    public static Decimal(min?: number, max?: number): number
    {
        if (min === undefined) { return Math.random(); }
        if (max === undefined) { return (Math.random() * min); }

        return (Math.random() * (max - min) + min);
    }

    /**
     * Picks a random valid index from a given array of elements.
     *
     * ---
     *
     * @template T The type of the elements in the array.
     *
     * @param elements
     * The array of elements to pick from.
     *
     * It must contain at least one element. Otherwise, a {@link ValueException} will be thrown.
     *
     * @returns A valid random index from the given array.
     */
    public static Index<T>(elements: readonly T[]): number
    {
        if (elements.length === 0) { throw new ValueException("You must provide at least one element."); }

        return this.Integer(elements.length);
    }

    /**
     * Picks a random element from a given array of elements.
     *
     * ---
     *
     * @template T The type of the elements in the array.
     *
     * @param elements
     * The array of elements to pick from.
     *
     * It must contain at least one element. Otherwise, a {@link ValueException} will be thrown.
     *
     * @returns A random element from the given array.
     */
    public static Choice<T>(elements: readonly T[]): T
    {
        return elements[Random.Index(elements)];
    }

    /**
     * Picks a random sample of elements from a given array without replacement.
     *
     * Uses the Fisher-Yates shuffle algorithm for uniform sampling,
     * which is O(count) instead of O(n log n) for a full shuffle.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Sample([1, 2, 3, 4, 5], 3); // e.g., [4, 1, 5]
     * ```
     *
     * ---
     *
     * @template T The type of the elements in the array.
     *
     * @param elements
     * The array of elements to sample from.
     *
     * It must contain at least one element. Otherwise, a {@link ValueException} will be thrown.
     *
     * @param count
     * The number of elements to sample.
     *
     * It must be between `0` and `elements.length`. Otherwise, a {@link ValueException} will be thrown.
     *
     * @returns An array containing the randomly sampled elements.
     */
    public static Sample<T>(elements: readonly T[], count: number): T[];

    /**
     * Picks a weighted random sample of elements from a given array without replacement.
     *
     * Uses the Efraimidis-Spirakis algorithm for weighted sampling.
     * Elements with higher weights have a higher probability of being selected.
     *
     * ---
     *
     * @example
     * ```ts
     * // Element "a" is 3x more likely to be picked than "b" or "c"
     * Random.Sample(["a", "b", "c"], 2, [3, 1, 1]);
     * ```
     *
     * ---
     *
     * @template T The type of the elements in the array.
     *
     * @param elements
     * The array of elements to sample from.
     *
     * It must contain at least one element. Otherwise, a {@link ValueException} will be thrown.
     *
     * @param count
     * The number of elements to sample.
     *
     * It must be between `0` and `elements.length`. Otherwise, a {@link ValueException} will be thrown.
     *
     * @param weights
     * The weights associated with each element.
     *
     * It must have the same length as the elements array.
     * All weights must be greater than zero. Otherwise, a {@link ValueException} will be thrown.
     *
     * @returns An array containing the randomly sampled elements.
     */
    public static Sample<T>(elements: readonly T[], count: number, weights: readonly number[]): T[];
    public static Sample<T>(elements: readonly T[], count: number, weights?: readonly number[]): T[]
    {
        const length = elements.length;

        if (length === 0) { throw new ValueException("You must provide at least one element."); }
        if (count < 0) { throw new ValueException("Count must be non-negative."); }
        if (count > length) { throw new ValueException("Count cannot exceed the number of elements."); }

        if (count === 0) { return []; }

        if (weights === undefined)
        {
            const pool = [...elements];
            const result: T[] = new Array(count);

            for (let index = 0; index < count; index += 1)
            {
                const randomIndex = this.Integer(index, length);

                result[index] = pool[randomIndex];
                pool[randomIndex] = pool[index];
            }

            return result;
        }

        if (weights.length !== length)
        {
            throw new ValueException("Weights array must have the same length as elements array.");
        }

        const keys: ({ index: number, key: number })[] = new Array(length);
        for (let index = 0; index < length; index += 1)
        {
            if (weights[index] <= 0)
            {
                throw new ValueException(`Weight for element #${index} must be greater than zero.`);
            }

            keys[index] = { index: index, key: Math.pow(Math.random(), 1 / weights[index]) };
        }

        keys.sort((a, b) => b.key - a.key);

        const result: T[] = new Array(count);
        for (let index = 0; index < count; index += 1)
        {
            result[index] = elements[keys[index].index];
        }

        return result;
    }

    private constructor() { /* ... */ }

    public readonly [Symbol.toStringTag]: string = "Random";
}
