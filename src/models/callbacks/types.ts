/**
 * A type representing a generic function.
 *
 * It can be used to define the signature of a callback, a event handler or any other function.  
 * It's simply a shorthand for the `(...args: A) => R` function signature.
 *
 * ```ts
 * const callback: Callback<[PointerEvent]> = (evt: PointerEvent): void => { [...] };
 * ```
 */
export type Callback<A extends unknown[] = [], R = void> = (...args: A) => R;
