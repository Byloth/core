import { ValueException } from "../models/index.js";

/**
 * A wrapper class around the native {@link Math.random} function that
 * provides a set of methods to generate random values more easily.
 * It can be used to generate random numbers, booleans and other different values.
 *
 * The class exposes two coexisting surfaces:
 * - A **static API** (`Random.Integer`, `Random.Boolean`, …) that uses
 *   {@link Math.random} and is therefore non-deterministic.
 * - An **instance API** with the same method names that uses a seeded PRNG
 *   (Mulberry32) for reproducible sequences. Instances are created via the
 *   {@link Random.FromSeed} factory; the constructor is private.
 */
export default class Random
{
    static #Mulberry32(seed: number): () => number
    {
        let state = seed | 0;

        return () =>
        {
            state = (state + 0x6D2B79F5) | 0;

            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    private static _Boolean(random: () => number, ratio: number): boolean
    {
        return (random() < ratio);
    }

    private static _Integer(random: () => number, min: number, max?: number): number
    {
        if (max === undefined) { return Math.floor(random() * min); }

        return Math.floor(random() * (max - min) + min);
    }

    private static _Decimal(random: () => number, min?: number, max?: number): number
    {
        if (min === undefined) { return random(); }
        if (max === undefined) { return (random() * min); }

        return (random() * (max - min) + min);
    }

    private static _Index<T>(random: () => number, elements: readonly T[]): number
    {
        if (elements.length === 0) { throw new ValueException("You must provide at least one element."); }

        return Random._Integer(random, elements.length);
    }

    private static _Choice<T>(random: () => number, elements: readonly T[]): T
    {
        return elements[Random._Index(random, elements)];
    }

    private static _Sample<T>(
        random: () => number,
        elements: readonly T[],
        count: number,
        weights?: readonly number[]
    ): T[]
    {
        const length = elements.length;

        if (length === 0) { throw new ValueException("You must provide at least one element."); }
        if (count < 0) { throw new ValueException("Count must be non-negative."); }
        if (count > length) { throw new ValueException("Count cannot exceed the number of elements."); }

        if (count === 0) { return []; }

        if (weights === undefined)
        {
            const pool = Array.from(elements);
            const result: T[] = new Array(count);

            for (let index = 0; index < count; index += 1)
            {
                const randomIndex = Random._Integer(random, index, length);

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

            keys[index] = { index: index, key: Math.pow(random(), 1 / weights[index]) };
        }

        keys.sort((a, b) => b.key - a.key);

        const result: T[] = new Array(count);
        for (let index = 0; index < count; index += 1)
        {
            result[index] = elements[keys[index].index];
        }

        return result;
    }

    static #Split(random: () => number, total: number, parts: number): number[]
    {
        const cuts: number[] = new Array(parts - 1);
        for (let index = 0; index < cuts.length; index += 1)
        {
            cuts[index] = random() * total;
        }

        cuts.sort((a, b) => (a - b));

        const boundaries = [0, ...cuts, total];
        const values: number[] = new Array(parts);

        for (let index = 0; index < parts; index += 1)
        {
            values[index] = Math.floor(boundaries[index + 1] - boundaries[index]);
        }

        let remainder = total - values.reduce((sum, val) => (sum + val), 0);
        while (remainder > 0)
        {
            values[Random._Integer(random, parts)] += 1;

            remainder -= 1;
        }

        return values;
    }

    private static _Split<T>(
        random: () => number,
        totalOrElements: number | Iterable<T>,
        parts: number
    ): number[] | T[][]
    {
        if (parts < 1) { throw new ValueException("The number of splits must be greater than zero."); }

        if (typeof totalOrElements === "number")
        {
            if (totalOrElements < 0) { throw new ValueException("The total must be a non-negative number."); }

            return Random.#Split(random, totalOrElements, parts);
        }

        const elements = Array.from(totalOrElements);
        const length = elements.length;

        if (length === 0) { throw new ValueException("You must provide at least one element."); }
        if (parts > length)
        {
            throw new ValueException("The number of splits cannot exceed the number of elements.");
        }

        const sizes = Random.#Split(random, length, parts);
        const groups: T[][] = new Array(parts);

        let offset = 0;
        for (let index = 0; index < parts; index += 1)
        {
            groups[index] = elements.slice(offset, offset + sizes[index]);

            offset += sizes[index];
        }

        return groups;
    }

    /**
     * Generates a random boolean value.  
     * See also {@link Random.boolean} for the seeded & deterministic counterpart.
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
        return Random._Boolean(Math.random, ratio);
    }

    /**
     * Generates a random integer value between `0` (included) and `max` (excluded).  
     * See also {@link Random.integer} for the seeded & deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Integer(5); // [0, 5)
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
     * See also {@link Random.integer} for the seeded & deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Integer(2, 7); // [2, 7)
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
        return Random._Integer(Math.random, min, max);
    }

    /**
     * Generates a random decimal value between `0` (included) and `1` (excluded).  
     * See also {@link Random.decimal} for the seeded & deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Decimal(); // e.g. 0.123456789
     * ```
     *
     * ---
     *
     * @returns A random decimal value.
     */
    public static Decimal(): number;

    /**
     * Generates a random decimal value between `0` (included) and `max` (excluded).  
     * See also {@link Random.decimal} for the seeded & deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Decimal(5); // e.g. 2.3456789
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
     * See also {@link Random.decimal} for the seeded & deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Decimal(2, 7); // e.g. 4.56789
     * ```
     *
     * ---
     *
     * @param min The minimum value (included).
     * @param max The maximum value (excluded).
     *
     * @returns A random decimal value.
     */
    public static Decimal(min: number, max: number): number;
    public static Decimal(min?: number, max?: number): number
    {
        return Random._Decimal(Math.random, min, max);
    }

    /**
     * Picks a random valid index from a given array of elements.  
     * See also {@link Random.index} for the seeded & deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const elements = ["a", "b", "c"];
     *
     * Random.Index(elements); // 0, 1, or 2
     * ```
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
        return Random._Index(Math.random, elements);
    }

    /**
     * Picks a random element from a given array of elements.  
     * See also {@link Random.choice} for the seeded & deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const elements = ["a", "b", "c"];
     *
     * Random.Choice(elements); // "a", "b", or "c"
     * ```
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
        return Random._Choice(Math.random, elements);
    }

    /**
     * Picks a random sample of elements from a given array without replacement.  
     * See also {@link Random.sample} for the seeded & deterministic counterpart.
     *
     * Uses the Fisher-Yates shuffle algorithm for uniform sampling,
     * which is O(count) instead of O(n log n) for a full shuffle.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Sample([1, 2, 3, 4, 5], 3); // e.g. [4, 1, 5]
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
     * See also {@link Random.sample} for the seeded & deterministic counterpart.
     *
     * Uses the Efraimidis-Spirakis algorithm for weighted sampling.
     * Elements with higher weights have a higher probability of being selected.
     *
     * ---
     *
     * @example
     * ```ts
     * // Element "a" is 3x more likely to be picked than "b" or "c"
     * Random.Sample(["a", "b", "c"], 2, [3, 1, 1]); // e.g. ["a", "c"]
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
        return Random._Sample(Math.random, elements, count, weights);
    }

    /**
     * Splits a total amount into a given number of randomly balanced integer parts that sum to the total.  
     * See also {@link Random.split} for the seeded & deterministic counterpart.
     *
     * Uses random cut-points to generate a uniform distribution of parts.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Split(100, 3); // e.g. [28, 41, 31]
     * Random.Split(10, 4);  // e.g. [3, 1, 4, 2]
     * ```
     *
     * ---
     *
     * @param total
     * The total amount to split.
     *
     * It must be non-negative. Otherwise, a {@link ValueException} will be thrown.
     *
     * @param parts
     * The number of parts to split the total into.
     *
     * It must be at least `1`. Otherwise, a {@link ValueException} will be thrown.
     *
     * @returns An array of integers that sum to the given total.
     */
    public static Split(total: number, parts: number): number[];

    /**
     * Splits an iterable of elements into a given number of randomly balanced groups.  
     * See also {@link Random.split} for the seeded & deterministic counterpart.
     *
     * The elements are distributed into groups whose sizes are
     * determined by a random split of the total number of elements.
     *
     * ---
     *
     * @example
     * ```ts
     * Random.Split([1, 2, 3, 4, 5], 2); // e.g. [[1, 2], [3, 4, 5]]
     * Random.Split([1, 2, 3, 4, 5], 2); // e.g. [[1, 2, 3, 4], [5]]
     * Random.Split("abcdef", 3);        // e.g. [["a"], ["b", "c", "d"], ["e", "f"]]
     * ```
     *
     * ---
     *
     * @template T The type of the elements in the iterable.
     *
     * @param elements
     * The iterable of elements to split into groups.
     *
     * It must contain at least one element. Otherwise, a {@link ValueException} will be thrown.
     *
     * @param groups
     * The number of groups to split the elements into.
     *
     * It must be between `1` and the number of elements.
     * Otherwise, a {@link ValueException} will be thrown.
     *
     * @returns An array of arrays, each containing a subset of the original elements.
     */
    public static Split<T>(elements: Iterable<T>, groups: number): T[][];
    public static Split<T>(totalOrElements: number | Iterable<T>, parts: number): number[] | T[][]
    {
        return Random._Split(Math.random, totalOrElements, parts);
    }

    /**
     * Creates a new seedable {@link Random} generator instance.
     *
     * The returned instance exposes the same API as the static {@link Random} class,
     * but produces deterministic sequences driven by the given seed.
     * Two instances built with the same seed will emit the same values in the same order.
     *
     * Internally, values are produced by a Mulberry32 PRNG.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(42); // deterministic — same seed, same sequence
     *
     * rng.integer(100); // 60
     * rng.decimal();    // 0.44829055899754167
     * ```
     *
     * ---
     *
     * @param seed The 32-bit integer seed used to initialize the generator.
     *
     * @returns A new {@link Random} instance bound to the given seed.
     */
    public static FromSeed(seed: number): Random
    {
        return new Random(seed);
    }

    private readonly _next: () => number;

    private constructor(seed: number)
    {
        this._next = Random.#Mulberry32(seed);
    }

    /**
     * Generates a random boolean value.  
     * See also {@link Random.Boolean} for the static & non-deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * if (rng.boolean())
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
    public boolean(ratio = 0.5): boolean
    {
        return Random._Boolean(this._next, ratio);
    }

    /**
     * Generates a random integer value between `0` (included) and `max` (excluded).  
     * See also {@link Random.Integer} for the static & non-deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     * 
     * rng.integer(5); // [0, 5)
     * ```
     *
     * ---
     *
     * @param max The maximum value (excluded).
     *
     * @returns A random integer value.
     */
    public integer(max: number): number;

    /**
     * Generates a random integer value between `min` (included) and `max` (excluded).  
     * See also {@link Random.Integer} for the static & non-deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.integer(2, 7); // [2, 7)
     * ```
     *
     * ---
     *
     * @param min The minimum value (included).
     * @param max The maximum value (excluded).
     *
     * @returns A random integer value.
     */
    public integer(min: number, max: number): number;
    public integer(min: number, max?: number): number
    {
        return Random._Integer(this._next, min, max);
    }

    /**
     * Generates a random decimal value between `0` (included) and `1` (excluded).  
     * See also {@link Random.Decimal} for the static & non-deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.decimal(); // e.g. 0.123456789
     * ```
     *
     * ---
     *
     * @returns A random decimal value.
     */
    public decimal(): number;

    /**
     * Generates a random decimal value between `0` (included) and `max` (excluded).  
     * See also {@link Random.Decimal} for the static & non-deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.decimal(5); // e.g. 2.3456789
     * ```
     *
     * ---
     *
     * @param max The maximum value (excluded).
     *
     * @returns A random decimal value.
     */
    public decimal(max: number): number;

    /**
     * Generates a random decimal value between `min` (included) and `max` (excluded).  
     * See also {@link Random.Decimal} for the static & non-deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.decimal(2, 7); // e.g. 4.56789
     * ```
     *
     * ---
     *
     * @param min The minimum value (included).
     * @param max The maximum value (excluded).
     *
     * @returns A random decimal value.
     */
    public decimal(min: number, max: number): number;
    public decimal(min?: number, max?: number): number
    {
        return Random._Decimal(this._next, min, max);
    }

    /**
     * Picks a random valid index from a given array of elements.  
     * See also {@link Random.Index} for the static & non-deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.index(["a", "b", "c"]); // 0, 1, or 2
     * ```
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
    public index<T>(elements: readonly T[]): number
    {
        return Random._Index(this._next, elements);
    }

    /**
     * Picks a random element from a given array of elements.  
     * See also {@link Random.Choice} for the static & non-deterministic counterpart.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.choice(["a", "b", "c"]); // "a", "b", or "c"
     * ```
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
    public choice<T>(elements: readonly T[]): T
    {
        return Random._Choice(this._next, elements);
    }

    /**
     * Picks a random sample of elements from a given array without replacement.  
     * See also {@link Random.Sample} for the static & non-deterministic counterpart.
     *
     * Uses the Fisher-Yates shuffle algorithm for uniform sampling,
     * which is O(count) instead of O(n log n) for a full shuffle.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.sample([1, 2, 3, 4, 5], 3); // e.g. [4, 1, 5]
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
    public sample<T>(elements: readonly T[], count: number): T[];

    /**
     * Picks a weighted random sample of elements from a given array without replacement.  
     * See also {@link Random.Sample} for the static & non-deterministic counterpart.
     *
     * Uses the Efraimidis-Spirakis algorithm for weighted sampling.
     * Elements with higher weights have a higher probability of being selected.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * // Element "a" is 3x more likely to be picked than "b" or "c"
     * rng.sample(["a", "b", "c"], 2, [3, 1, 1]); // e.g. ["a", "c"]
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
    public sample<T>(elements: readonly T[], count: number, weights: readonly number[]): T[];
    public sample<T>(elements: readonly T[], count: number, weights?: readonly number[]): T[]
    {
        return Random._Sample(this._next, elements, count, weights);
    }

    /**
     * Splits a total amount into a given number of randomly balanced integer parts that sum to the total.  
     * See also {@link Random.Split} for the static & non-deterministic counterpart.
     *
     * Uses random cut-points to generate a uniform distribution of parts.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.split(100, 3); // e.g. [28, 41, 31]
     * rng.split(10, 4);  // e.g. [3, 1, 4, 2]
     * ```
     *
     * ---
     *
     * @param total
     * The total amount to split.
     *
     * It must be non-negative. Otherwise, a {@link ValueException} will be thrown.
     *
     * @param parts
     * The number of parts to split the total into.
     *
     * It must be at least `1`. Otherwise, a {@link ValueException} will be thrown.
     *
     * @returns An array of integers that sum to the given total.
     */
    public split(total: number, parts: number): number[];

    /**
     * Splits an iterable of elements into a given number of randomly balanced groups.  
     * See also {@link Random.Split} for the static & non-deterministic counterpart.
     *
     * The elements are distributed into groups whose sizes are
     * determined by a random split of the total number of elements.
     *
     * ---
     *
     * @example
     * ```ts
     * const rng = Random.FromSeed(...);
     *
     * rng.split([1, 2, 3, 4, 5], 2); // e.g. [[1, 2], [3, 4, 5]]
     * rng.split([1, 2, 3, 4, 5], 2); // e.g. [[1, 2, 3, 4], [5]]
     * rng.split("abcdef", 3);        // e.g. [["a"], ["b", "c", "d"], ["e", "f"]]
     * ```
     *
     * ---
     *
     * @template T The type of the elements in the iterable.
     *
     * @param elements
     * The iterable of elements to split into groups.
     *
     * It must contain at least one element. Otherwise, a {@link ValueException} will be thrown.
     *
     * @param groups
     * The number of groups to split the elements into.
     *
     * It must be between `1` and the number of elements.
     * Otherwise, a {@link ValueException} will be thrown.
     *
     * @returns An array of arrays, each containing a subset of the original elements.
     */
    public split<T>(elements: Iterable<T>, groups: number): T[][];
    public split<T>(totalOrElements: number | Iterable<T>, parts: number): number[] | T[][]
    {
        return Random._Split(this._next, totalOrElements, parts);
    }

    public readonly [Symbol.toStringTag]: string = "Random";
}
