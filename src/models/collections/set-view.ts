import Publisher from "../callbacks/publisher.js";
import type { Subscribable } from "../types.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type MapView from "./map-view.js";
import type { SetViewEventsMap } from "./types.js";

/**
 * A wrapper class around the native {@link Set} class that provides additional functionality
 * for publishing events when entries are added, removed or the collection is cleared.  
 * There's also a complementary class that works with the native `Map` class.
 * See also {@link MapView}.
 *
 * ---
 *
 * @example
 * ```ts
 * const set = new SetView<number>();
 *
 * set.subscribe("entry:add", (value: number) => console.log(`Added ${value}`));
 * set.add(42); // "Added 42"
 * ```
 *
 * ---
 *
 * @template T The type of the values in the set.
 */
export default class SetView<T> extends Set<T> implements Subscribable<SetViewEventsMap<T>>
{
    /**
     * The internal {@link Publisher} instance used to publish events.
     */
    protected readonly _publisher: Publisher<SetViewEventsMap<T>>;

    /**
     * Initializes a new instance of the {@link SetView} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const set = new SetView<number>([2, 4, 8]);
     * ```
     *
     * ---
     *
     * @param iterable An optional iterable of values to initialize the {@link Set} with.
     */
    public constructor(iterable?: Iterable<T> | null)
    {
        super();

        this._publisher = new Publisher();

        if (iterable)
        {
            for (const value of iterable) { this.add(value); }
        }
    }

    /**
     * Appends a new element with a specified value to the end of the {@link Set}.  
     * If the value already exists, it will not be added again.
     *
     * ---
     *
     * @example
     * ```ts
     * const set = new SetView<number>();
     * set.add(2)
     *     .add(4)
     *     .add(8);
     *
     * console.log(set); // SetView(4) { 2, 4, 8 }
     * ```
     *
     * ---
     *
     * @param value The value to add.
     *
     * @returns The current instance of the {@link SetView} class.
     */
    public override add(value: T): this
    {
        super.add(value);

        this._publisher.publish("entry:add", value);

        return this;
    }

    /**
     * Removes the specified value from the {@link Set}.
     *
     * ---
     *
     * @example
     * ```ts
     * const set = new SetView<number>([2, 4, 8]);
     * set.delete(4); // true
     * set.delete(16); // false
     *
     * console.log(set); // SetView(2) { 2, 8 }
     * ```
     *
     * ---
     *
     * @param value The value to remove.
     *
     * @returns `true` if the entry existed and has been removed; otherwise `false` if the entry doesn't exist.
     */
    public override delete(value: T): boolean
    {
        const result = super.delete(value);
        if (result) { this._publisher.publish("entry:remove", value); }

        return result;
    }

    /**
     * Removes all entries from the {@link Set}.
     *
     * ---
     *
     * @example
     * ```ts
     * const set = new SetView<number>([2, 4, 8]);
     * set.clear();
     *
     * console.log(set); // SetView(0) { }
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
     * @param subscriber The callback to execute when the event is published.
     *
     * @returns A function that can be used to unsubscribe the callback from the event.
     */
    public subscribe<K extends keyof SetViewEventsMap<T>>(event: K & string, subscriber: SetViewEventsMap<T>[K])
        : () => void
    {
        return this._publisher.subscribe(event, subscriber);
    }

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
     * @param subscriber The callback to remove from the event.
     */
    public unsubscribe<K extends keyof SetViewEventsMap<T>>(event: K & string, subscriber: SetViewEventsMap<T>[K]): void
    {
        this._publisher.unsubscribe(event, subscriber);
    }

    public override readonly [Symbol.toStringTag]: string = "SetView";
}
