/**
 * An utility class that provides a set of methods to compute deterministic hashes.  
 * It can be used to derive stable integers or decimals from strings and tuples of values.
 *
 * It's the stateless tier of the library's random-value vocabulary: {@link Hash.Integer} / {@link Hash.Decimal}
 * are reproducible values derived from their inputs alone, with no state to keep and nothing to allocate.
 *
 * It cannot be instantiated directly.
 */
export default class Hash
{
    /**
     * Computes the hash of a given string.
     *
     * The hash is computed using a polynomial rolling hash with a multiplier of `31`.  
     * The result is guaranteed to be a 32-bit signed integer.
     *
     * ---
     *
     * @example
     * ```ts
     * Hash.String("Hello, world!"); // -1880044555
     * Hash.String("How are you?");  // 1761539132
     * ```
     *
     * ---
     *
     * @param value The string to hash.
     *
     * @returns The hash of the specified string.
     */
    public static String(value: string): number
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
     * Deterministically mixes any number of values into a single 32-bit signed integer.  
     * See also {@link Hash.Decimal} for the `[0, 1)` decimal counterpart.
     *
     * It's meant to derive stable hashes and seeds from a tuple of inputs: for example
     * a per-chunk seed from a world seed and the chunk coordinates (`Hash.Integer(seed, x, z)`).  
     * The order of the values matters: `Hash.Integer(1, 2)` differs from `Hash.Integer(2, 1)`.
     *
     * Also note that:
     * - Numbers are truncated to 32-bit signed integers before mixing: `Hash.Integer(1.9)` equals `Hash.Integer(1)`.
     * - Strings are hashed with {@link Hash.String} before mixing, so they can be used as salts.  
     *   This means `Hash.Integer("abc")` differs from `Hash.String("abc")`: the former mixes the latter.
     * - Mixing no values at all is well-defined and returns a constant.
     *
     * ---
     *
     * @example
     * ```ts
     * Hash.Integer(42, 1, 2); // -868739727
     * Hash.Integer(42, 2, 1); // -1591390021
     *
     * const chunkRng = Random.FromSeed(Hash.Integer(worldSeed, chunkX, chunkZ));
     * ```
     *
     * ---
     *
     * @param values
     * The values to mix. Numbers are truncated to 32-bit signed integers; strings are hashed with {@link Hash.String}.
     *
     * @returns A 32-bit signed integer.
     */
    public static Integer(...values: readonly (number | string)[]): number
    {
        let hashedValue = 0x811C9DC5 | 0;

        for (const value of values)
        {
            const integer = (typeof value === "string") ? Hash.String(value) : (value | 0);

            hashedValue = Math.imul(hashedValue ^ integer, 0x9E3779B1);
            hashedValue ^= hashedValue >>> 15;
            hashedValue = Math.imul(hashedValue, 0x85EBCA77);
            hashedValue ^= hashedValue >>> 13;
        }

        hashedValue = Math.imul(hashedValue ^ (hashedValue >>> 16), 0xC2B2AE3D);
        hashedValue ^= hashedValue >>> 16;

        return hashedValue | 0;
    }

    /**
     * Deterministically mixes any number of values into a single decimal number in the `[0, 1)` range.  
     * See also {@link Hash.Integer} for the integer counterpart.
     *
     * It's the allocation-free way to derive a stable "random-looking" value from a tuple of inputs
     * (for example a world seed, a pair of coordinates and a salt) without instantiating a {@link Random}.
     *
     * ---
     *
     * @example
     * ```ts
     * Hash.Decimal(42, 1, 2);        // 0.797730770194903
     * Hash.Decimal(42, 1, 2, "yaw"); // Same inputs plus a salt: a different, but still stable, value.
     * ```
     *
     * ---
     *
     * @param values
     * The values to mix. Numbers are truncated to 32-bit signed integers; strings are hashed with {@link Hash.String}.
     *
     * @returns A decimal number in the `[0, 1)` range.
     */
    public static Decimal(...values: readonly (number | string)[]): number
    {
        return (Hash.Integer(...values) >>> 0) / 4_294_967_296;
    }

    private constructor() { /* ... */ }

    public readonly [Symbol.toStringTag]: string = "Hash";
}
