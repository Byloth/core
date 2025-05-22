import Publisher from "../callbacks/publisher.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type SetView from "./set-view.js";
import type { MapViewEventsMap } from "./types.js";

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
 * map.subscribe("entry:add", (key: string, value: number) => console.log(`Added ${key}: ${value}`));
 * map.set("answer", 42); // Added answer: 42
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

        this._publisher.publish("entry:add", key, value);

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

        this._publisher.publish("entry:remove", key, value);

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
        if (size > 0) { this._publisher.publish("collection:clear"); }
    }

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
     * map.set("key1", 2); // Added key1: 2
     * map.set("answer", 42); // Added answer: 42
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
    public subscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): () => void
    {
        return this._publisher.subscribe(event, callback);
    }

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
     * map.set("key1", 2); // Added key1: 2
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
    public unsubscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): void
    {
        this._publisher.unsubscribe(event, callback);
    }

    public override readonly [Symbol.toStringTag]: string = "MapView";
}
