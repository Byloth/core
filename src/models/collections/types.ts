import type { Callback } from "../types.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type MapView from "./map-view.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type SetView from "./set-view.js";

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
     * Subscribes to the `add` event of the map with a callback that will be executed when an entry is added.
     *
     * ---
     *
     * @example
     * ```ts
     * map.onAdd((key, value) => console.log(`Added ${key}: ${value}`));
     *
     * map.set("key1", 2); // "Added key1: 2"
     * map.set("answer", 42); // "Added answer: 42"
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when an entry is added to the map.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    onAdd(callback: (key: K, value: V) => void): Callback;

    /**
     * Subscribes to the `remove` event of the map with a callback that will be executed when an entry is removed.
     *
     * ---
     *
     * @example
     * ```ts
     * map.onRemove((key, value) => console.log(`Removed ${key}: ${value}`));
     *
     * map.delete("key1"); // "Removed key1: 2"
     * map.delete("answer"); // "Removed answer: 42"
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when an entry is removed from the map.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    onRemove(callback: (key: K, value: V) => void): Callback;

    /**
     * Subscribes to the `clear` event of the map with a callback that will be executed when the map is cleared.
     *
     * ---
     *
     * @example
     * ```ts
     * map.onClear(() => console.log("The map has all been cleared."));
     * map.clear();
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when the map is cleared.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    onClear(callback: () => void): Callback;
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
     * Subscribes to the `add` event of the set with a callback that will be executed when a value is added.
     *
     * ---
     *
     * @example
     * ```ts
     * set.onAdd((value) => console.log(`Added ${value}`));
     *
     * set.add(2); // "Added 2"
     * set.add(42); // "Added 42"
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when a value is added to the set.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    onAdd(callback: (value: T) => void): Callback;

    /**
     * Subscribes to the `remove` event of the set with a callback that will be executed when a value is removed.
     *
     * ---
     *
     * @example
     * ```ts
     * set.onRemove((value) => console.log(`Removed ${value}`));
     *
     * set.delete(2); // "Removed 2"
     * set.delete(42); // "Removed 42"
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when a value is removed from the set.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    onRemove(callback: (value: T) => void): Callback;

    /**
     * Subscribes to the `clear` event of the set with a callback that will be executed when the set is cleared.
     *
     * ---
     *
     * @example
     * ```ts
     * set.onClear(() => console.log("The set has all been cleared."));
     * set.clear(); // "The set has all been cleared."
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when the set is cleared.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    onClear(callback: () => void): Callback;
}
