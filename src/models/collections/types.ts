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
    "entry:remove": (key: K) => void;

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
    subscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): () => void;
    unsubscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): void;
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
    subscribe<K extends keyof SetViewEventsMap<T>>(event: K, callback: SetViewEventsMap<T>[K]): () => void;
    unsubscribe<K extends keyof SetViewEventsMap<T>>(event: K, callback: SetViewEventsMap<T>[K]): void;
}
