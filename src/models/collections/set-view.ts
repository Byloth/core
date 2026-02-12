import Publisher from "../callbacks/publisher.js";
import type { Callback } from "../types.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type ArrayView from "./array-view.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type MapView from "./map-view.js";

interface SetViewEventsMap<T>
{
    "add": (value: T) => void;
    "remove": (value: T) => void;

    "clear": () => void;
}

/**
 * A wrapper class around the native {@link Set} class that provides additional functionality
 * for publishing events when entries are added, removed or the collection is cleared.  
 * There are also complementary classes that work with the native `Array` and `Map` classes.
 * See also {@link ArrayView} and {@link MapView}.
 *
 * ---
 *
 * @example
 * ```ts
 * const set = new SetView<number>();
 *
 * set.onAdd((value: number) => console.log(`Added ${value}`));
 * set.add(42); // "Added 42"
 * ```
 *
 * ---
 *
 * @template T The type of the values in the set.
 */
export default class SetView<T> extends Set<T>
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
            for (const value of iterable) { super.add(value); }
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
     * console.log(set); // SetView(3) { 2, 4, 8 }
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

        this._publisher.publish("add", value);

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
        if (result) { this._publisher.publish("remove", value); }

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
        if (size > 0) { this._publisher.publish("clear"); }
    }

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
    public onAdd(callback: (value: T) => void): Callback
    {
        return this._publisher.subscribe("add", callback);
    }

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
    public onRemove(callback: (value: T) => void): Callback
    {
        return this._publisher.subscribe("remove", callback);
    }

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
    public onClear(callback: () => void): Callback
    {
        return this._publisher.subscribe("clear", callback);
    }

    public override readonly [Symbol.toStringTag]: string = "SetView";
}
