import type { RegExpMatchCallback } from "./types.js";

/**
 * A fluent dispatcher that tests a string against a list of regular expressions
 * and returns the value produced by the callback of the first one that matches.
 *
 * Patterns are tested in the order they were registered, so the most specific
 * ones must come first. A default callback provides the value when nothing matches.
 *
 * Also note that:
 * - Patterns with the global flag are reset before each test, so they can be reused safely.
 * - Without a default callback, `undefined` is returned when nothing matches.
 *
 * ---
 *
 * @example
 * ```ts
 * const matcher = new RegExpMatcher()
 *     .on(/^https?:\/\//, () => "url")
 *     .on([/^\//, /^\.\.?\//], () => "path")
 *     .default(() => "unknown");
 *
 * matcher.match("https://byloth.dev"); // "url"
 * matcher.match("./index.html");       // "path"
 * matcher.match("byloth.dev");         // "unknown"
 * ```
 *
 * ---
 *
 * @template T The union of the types returned by the registered callbacks.
 * @template D The type returned when no pattern matches.
 */
export default class RegExpMatcher<T = never, D = undefined>
{
    protected readonly _matches: [RegExp, RegExpMatchCallback<unknown>][];
    protected _default: () => D;

    /**
     * Initializes a new instance of the {@link RegExpMatcher} class, without patterns nor default.
     *
     * ---
     *
     * @example
     * ```ts
     * const matcher = new RegExpMatcher();
     * ```
     */
    public constructor()
    {
        this._matches = [];
        this._default = () => (undefined as D);
    }

    /**
     * Registers one or more patterns along with the callback to invoke when one of them matches.
     *
     * ---
     *
     * @example
     * ```ts
     * matcher.on(/version\/([\d.]+)/i, (results) => results[1]);
     * matcher.on([/iPhone/, /iPad/], () => "iOS");
     * ```
     *
     * ---
     *
     * @template R The type of the value returned by the callback.
     *
     * @param patterns The pattern (or patterns) to test the string against.
     * @param callback The callback invoked with the result of the successful test.
     *
     * @returns The same {@link RegExpMatcher} instance, to chain further calls.
     */
    public on<R>(patterns: RegExp | readonly RegExp[], callback: RegExpMatchCallback<R>): RegExpMatcher<T | R, D>
    {
        const _patterns = (patterns instanceof RegExp) ? [patterns] : patterns;
        for (const pattern of _patterns)
        {
            this._matches.push([pattern, callback]);
        }

        return this as RegExpMatcher<T | R, D>;
    }

    /**
     * Sets the callback invoked when no pattern matches.
     *
     * ---
     *
     * @example
     * ```ts
     * matcher.default(() => "unknown");
     * ```
     *
     * ---
     *
     * @template R The type of the value returned by the callback.
     *
     * @param callback The callback invoked when no pattern matches.
     *
     * @returns The same {@link RegExpMatcher} instance, to chain further calls.
     */
    public default<R>(callback: () => R): RegExpMatcher<T, R>
    {
        const matcher = (this as unknown) as RegExpMatcher<T, R>;
        matcher._default = callback;

        return matcher;
    }

    /**
     * Tests a string against the registered patterns, in order,
     * and returns the value produced by the callback of the first match.
     *
     * ---
     *
     * @example
     * ```ts
     * const kind = matcher.match("https://byloth.dev");
     * ```
     *
     * ---
     *
     * @param value The string to test.
     *
     * @returns The value produced by the first matching callback, or by the default one.
     */
    public match(value: string): T | D
    {
        for (const [pattern, callback] of this._matches)
        {
            pattern.lastIndex = 0;

            const results = pattern.exec(value);
            if (results) { return callback(results) as T; }
        }

        return this._default();
    }

    public readonly [Symbol.toStringTag]: string = "RegExpMatcher";
}
