import { ValueException } from "../models/index.js";

/**
 * A utility class that provides a set of methods to generate random values.  
 * It can be used to generate random numbers, booleans and other different values.
 * 
 * It cannot be instantiated directly.
 */
export default class Random
{
    /**
     * Generates a random boolean value.
     *
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
     * Generates a random integer value between `0` and `max` (excluded).
     *
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
     * @param elements
     * The array of elements to pick from.
     *
     * It must contain at least one element. Otherwise, a `ValueException` will be thrown.
     * 
     * @returns A valid random index from the given array.
     */
    public static Index<T>(elements: T[]): number
    {
        if (elements.length === 0) { throw new ValueException("You must provide at least one element."); }

        return this.Integer(elements.length);
    }

    /**
     * Picks a random element from a given array of elements.
     *
     * @param elements
     * The array of elements to pick from.
     *
     * It must contain at least one element. Otherwise, a `ValueException` will be thrown.
     * 
     * @returns A random element from the given array.
     */
    public static Choice<T>(elements: T[]): T
    {
        return elements[Random.Index(elements)];
    }

    private constructor() { /* ... */ }

    public readonly [Symbol.toStringTag]: string = "Random";
}
