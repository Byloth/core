// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type Publisher from "./publisher.js";

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

/**
 * An utility type that is required to represents a map of callbacks.
 *
 * It is used for type inheritance on the {@link Publisher} class signature.  
 * Whenever you'll need to extend that class, you may need to use this type too.
 *
 * ---
 *
 * @example
 * ```ts
 * interface EventsMap
 * {
 *     "player:spawn": (evt: SpawnEvent) => void;
 *     "player:move": ({ x, y }: Point) => void;
 *     "player:death": () => void;
 * }
 *
 * class EventManager<T extends CallbackMap<T> = { }> extends Publisher<T> { [...] }
 * ```
 *
 * ---
 *
 * @template T The interface defining the map of callbacks. Default is `Record<string, Callback<unknown[], unknown>>`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CallbackMap<T = Record<string, Callback<unknown[], unknown>>> = { [K in keyof T]: Callback<any[], any> };
