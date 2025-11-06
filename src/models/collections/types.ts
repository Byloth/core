import type { Callback } from "../types.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type MapView from "./map-view.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type SetView from "./set-view.js";

/**
 * A type that represents the map of events published by a {@link MapView} object.
 * See also {@link SetViewEventsMap}.
 *
 * The keys of the map are the event names while the values are the callback function signatures.
 *
 * ---
 *
 * @template K The type of the keys in the map.
 * @template V The type of the values in the map.
 */
export interface MapViewEventsMap<K, V>
{
    "entry:add": (key: K, value: V) => void;
    "entry:remove": (key: K, value: V) => void;

    "collection:clear": () => void;
}

/**
 * An utility type that represents a read-only {@link MapView} object.
 * See also {@link ReadonlySetView}.
 *
 * It can be used to prevent the user from modifying the map while
 * still allowing them to access the entries and subscribe to events.
 *
 * ---
 *
 * @template K The type of keys in the map.
 * @template V The type of values in the map.
 */
export interface ReadonlyMapView<K, V> extends ReadonlyMap<K, V>
{
    /**
     * Subscribes to an event and adds a callback to be executed when the event is published.
     *
     * ---
     *
     * @example
     * ```ts
     * const map = new MapView<string, number>();
     * const unsubscribe = map.subscribe("entry:add", (key: string, value: number) =>
     * {
     *     if (key === "answer") { unsubscribe(); }
     *     console.log(`Added ${key}: ${value}`);
     * });
     *
     * map.set("key1", 2); // "Added key1: 2"
     * map.set("answer", 42); // "Added answer: 42"
     * map.set("key2", 4);
     * map.set("key3", 8);
     * ```
     *
     * ---
     *
     * @template T The key of the map containing the callback signature to subscribe.
     *
     * @param event The name of the event to subscribe to.
     * @param callback The callback to execute when the event is published.
     *
     * @returns A function that can be used to unsubscribe the callback from the event.
     */
    subscribe<T extends keyof MapViewEventsMap<K, V>>(event: T & string, callback: MapViewEventsMap<K, V>[T]): Callback;

    /**
     * Unsubscribes from an event and removes a callback from being executed when the event is published.
     *
     * ---
     *
     * @example
     * ```ts
     * const callback = (key: string, value: number) => console.log(`Added ${key}: ${value}`);
     * const map = new MapView<string, number>();
     *
     * map.subscribe("entry:add", callback);
     * map.set("key1", 2); // "Added key1: 2"
     *
     * map.unsubscribe("entry:add", callback);
     * map.set("key2", 4);
     * ```
     *
     * ---
     *
     * @template T The key of the map containing the callback signature to unsubscribe.
     *
     * @param event The name of the event to unsubscribe from.
     * @param callback The callback to remove from the event.
     */
    unsubscribe<T extends keyof MapViewEventsMap<K, V>>(event: T & string, callback: MapViewEventsMap<K, V>[T]): void;
}

/**
 * A type that represents the map of events published by a {@link SetView} object.
 * See also {@link MapViewEventsMap}.
 *
 * The keys of the map are the event names while the values are the callback function signatures.
 *
 * ---
 *
 * @template T The type of the values in the set.
 */
export interface SetViewEventsMap<T>
{
    "entry:add": (value: T) => void;
    "entry:remove": (value: T) => void;

    "collection:clear": () => void;
}

/**
 * An utility type that represents a read-only {@link SetView} object.
 * See also {@link ReadonlyMapView}.
 *
 * It can be used to prevent the user from modifying the set while
 * still allowing them to access the entries and subscribe to events.
 *
 * ---
 *
 * @template T The type of values in the set.
 */
export interface ReadonlySetView<T> extends ReadonlySet<T>
{
    /**
     * Subscribes to an event and adds a callback to be executed when the event is published.
     *
     * ---
     *
     * @example
     * ```ts
     * const set = new SetView<number>();
     * const unsubscribe = set.subscribe("entry:add", (value: number) =>
     * {
     *     if (value === 42) { unsubscribe(); }
     *     console.log(`Added ${value}`);
     * });
     *
     * set.add(2); // "Added 2"
     * set.add(42); // "Added 42"
     * set.add(4);
     * set.add(8);
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the callback signature to subscribe.
     *
     * @param event The name of the event to subscribe to.
     * @param callback The callback to execute when the event is published.
     *
     * @returns A function that can be used to unsubscribe the callback from the event.
     */
    subscribe<K extends keyof SetViewEventsMap<T>>(event: K & string, callback: SetViewEventsMap<T>[K]): Callback;

    /**
     * Unsubscribes from an event and removes a callback from being executed when the event is published.
     *
     * ---
     *
     * @example
     * ```ts
     * const callback = (value: number) => console.log(`Added ${value}`);
     * const set = new SetView<number>();
     *
     * set.subscribe("entry:add", callback);
     * set.add(2); // "Added 2"
     *
     * set.unsubscribe("entry:add", callback);
     * set.add(4);
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the callback signature to unsubscribe.
     *
     * @param event The name of the event to unsubscribe from.
     * @param callback The callback to remove from the event.
     */
    unsubscribe<K extends keyof SetViewEventsMap<T>>(event: K & string, callback: SetViewEventsMap<T>[K]): void;
}
