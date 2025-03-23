/**
 * A type that represents a generic function.
 *
 * It can be used to define the signature of a callback, a event handler or any other function.  
 * It's simply a shorthand for the `(...args: A) => R` function signature.
 *
 * ---
 *
 * @example
 * ```ts
 * const callback: Callback<[PointerEvent]> = (evt: PointerEvent): void => { [...] };
 * ```
 *
 * ---
 *
 * @template A
 * The type of the arguments that the function accepts.  
 * It must be an array of types, even if it's empty. Default is `[]`.
 *
 * @template R The return type of the function. Default is `void`.
 */
export type Callback<A extends unknown[] = [], R = void> = (...args: A) => R;
