import Publisher from "../callbacks/publisher.js";
import type { Callback } from "../types.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type SetView from "./set-view.js";

interface MapViewEventsMap<K, V>
{
    "add": (key: K, value: V) => void;
    "remove": (key: K, value: V) => void;

    "clear": () => void;
}

/**
 * A wrapper class around the native {@link Map} class that provides additional functionality
 * for publishing events when entries are added, removed or the collection is cleared.  
 * There's also a complementary class that works with the native `Set` class.
 * See also {@link SetView}.
 *
 * ---
 *
 * @example
 * ```ts
 * const map = new MapView<string, number>();
 *
 * map.onAdd((key: string, value: number) => console.log(`Added ${key}: ${value}`));
 * map.set("answer", 42); // "Added answer: 42"
 * ```
 *
 * ---
 *
 * @template K The type of the keys in the map.
 * @template V The type of the values in the map.
 */
export default class MapView<K, V> extends Map<K, V>
{
    /**
     * The internal {@link Publisher} instance used to publish events.
     */
    protected readonly _publisher: Publisher<MapViewEventsMap<K, V>>;

    /**
     * Initializes a new instance of the {@link MapView} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const map = new MapView<string, number>([["key1", 2], ["key2", 4], ["key3", 8]]);
     * ```
     *
     * ---
     *
     * @param iterable An optional iterable of key-value pairs to initialize the {@link Map} with.
     */
    public constructor(iterable?: Iterable<[K, V]> | null)
    {
        super();

        this._publisher = new Publisher();

        if (iterable)
        {
            for (const [key, value] of iterable) { this.set(key, value); }
        }
    }

    /**
     * Adds a new entry with a specified key and value to the {@link Map}.  
     * If an entry with the same key already exists, the entry will be overwritten with the new value.
     *
     * ---
     *
     * @example
     * ```ts
     * const map = new MapView<string, number>();
     * map.set("key1", 2)
     *     .set("key2", 4)
     *     .set("key3", 8);
     *
     * console.log(map); // MapView { "key1" => 2, "key2" => 4, "key3" => 8 }
     * ```
     *
     * ---
     *
     * @param key The key of the entry to add.
     * @param value The value of the entry to add.
     *
     * @returns The current instance of the {@link MapView} class.
     */
    public override set(key: K, value: V): this
    {
        super.set(key, value);

        this._publisher.publish("add", key, value);

        return this;
    }

    /**
     * Removes an entry with a specified key from the {@link Map}.
     *
     * ---
     *
     * @example
     * ```ts
     * const map = new MapView<string, number>([["key1", 2], ["key2", 4], ["key3", 8]]);
     * map.delete("key2"); // true
     * map.delete("key4"); // false
     *
     * console.log(map); // MapView { "key1" => 2, "key3" => 8 }
     * ```
     *
     * ---
     *
     * @param key The key of the entry to remove.
     *
     * @returns `true` if the entry existed and has been removed; otherwise `false` if the entry doesn't exist.
     */
    public override delete(key: K): boolean
    {
        const value = this.get(key);
        if (value === undefined) { return false; }

        super.delete(key);

        this._publisher.publish("remove", key, value);

        return true;
    }

    /**
     * Removes all entries from the {@link Map}.
     *
     * ---
     *
     * @example
     * ```ts
     * const map = new MapView<string, number>([["key1", 2], ["key2", 4], ["key3", 8]]);
     * map.clear();
     *
     * console.log(map); // MapView { }
     * ```
     */
    public override clear(): void
    {
        const size = this.size;

        super.clear();
        if (size > 0) { this._publisher.publish("clear"); }
    }

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
    public onAdd(callback: (key: K, value: V) => void): Callback
    {
        return this._publisher.subscribe("add", callback);
    }

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
    public onRemove(callback: (key: K, value: V) => void): Callback
    {
        return this._publisher.subscribe("remove", callback);
    }

    /**
     * Subscribes to the `clear` event of the map with a callback that will be executed when the map is cleared.
     *
     * ---
     *
     * @example
     * ```ts
     * map.onClear(() => console.log("The map has all been cleared."));
     * map.clear(); // "The map has all been cleared."
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when the map is cleared.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    public onClear(callback: () => void): Callback
    {
        return this._publisher.subscribe("clear", callback);
    }

    public override readonly [Symbol.toStringTag]: string = "MapView";
}
