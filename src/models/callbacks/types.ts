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

/**
 * An utility type that represents a {@link Publisher} object that can be published to.
 * See also {@link Subscribable}.
 *
 * It can be used to prevent the user from modifying the publisher while
 * still allowing them to subscribe to events and publish them.
 *
 * ---
 *
 * @template T
 * A map containing the names of the emittable events and the
 * related callback signatures that can be subscribed to them.  
 * Default is `Record<string, (...args: unknown[]) => unknown>`.
 */
export interface Publishable<T extends CallbackMap<T> = CallbackMap>
{
    /**
     * Publishes an event to all the subscribers.
     *
     * ---
     *
     * @example
     * ```ts
     * publisher.subscribe("player:move", (coords) => { [...] });
     * publisher.subscribe("player:move", ({ x, y }) => { [...] });
     * publisher.subscribe("player:move", (evt) => { [...] });
     *
     * publisher.publish("player:move", { x: 10, y: 20 });
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the callback signature to publish.
     *
     * @param event The name of the event to publish.
     * @param args The arguments to pass to the subscribers.
     *
     * @returns An array containing the return values of all the subscribers.
     */
    publish<K extends keyof T>(event: K & string, ...args: Parameters<T[K]>): ReturnType<T[K]>[];
}

/**
 * An utility type that represents a {@link Publisher} object that can be subscribed to.
 * See also {@link Publishable}.
 * 
 * It can be used to prevent the user from modifying the publisher while
 * still allowing them to subscribe to events and publish them.
 *
 * ---
 *
 * @template T
 * A map containing the names of the emittable events and the
 * related callback signatures that can be subscribed to them.  
 * Default is `Record<string, (...args: unknown[]) => unknown>`.
 */
export interface Subscribable<T extends CallbackMap<T> = CallbackMap>
{
    /**
     * Subscribes to an event and adds a subscriber to be executed when the event is published.
     *
     * ---
     *
     * @example
     * ```ts
     * let unsubscribe: () => void;
     * publisher.subscribe("player:death", unsubscribe);
     * publisher.subscribe("player:spawn", (evt) =>
     * {
     *     unsubscribe = publisher.subscribe("player:move", ({ x, y }) => { [...] });
     * });
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the callback signature to subscribe.
     *
     * @param event The name of the event to subscribe to.
     * @param subscriber The subscriber to execute when the event is published.
     *
     * @returns A function that can be used to unsubscribe the subscriber from the event.
     */
    subscribe<K extends keyof T>(event: K & string, subscriber: T[K]): () => void;

    /**
     * Unsubscribes from an event and removes a subscriber from being executed when the event is published.
     *
     * ---
     *
     * @example
     * ```ts
     * const onPlayerMove = ({ x, y }: Point) => { [...] };
     *
     * publisher.subscribe("player:spawn", (evt) => publisher.subscribe("player:move", onPlayerMove));
     * publisher.subscribe("player:death", () => publisher.unsubscribe("player:move", onPlayerMove));
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the callback signature to unsubscribe.
     *
     * @param event The name of the event to unsubscribe from.
     * @param subscriber The subscriber to remove from the event.
     */
    unsubscribe<K extends keyof T>(event: K & string, subscriber: T[K]): void;
}
