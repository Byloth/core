/**
 * The callback invoked by a {@link RegExpMatcher} when one of its patterns matches.
 *
 * ---
 *
 * @example
 * ```ts
 * const onVersion: RegExpMatchCallback<string> = (results) => results[1];
 * ```
 *
 * ---
 *
 * @template T The type of the value returned by the callback.
 *
 * @param results The result of the successful {@link RegExp.exec} call, captures included.
 *
 * @returns The value produced for the match.
 */
export type RegExpMatchCallback<T = void> = (results: RegExpExecArray) => T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type RegExpMatcher from "./regexp-matcher.js";
