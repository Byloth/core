import Publisher from "../callbacks/publisher.js";
import type { Callback } from "../types.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type MapView from "./map-view.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type SetView from "./set-view.js";

interface ArrayViewEventsMap<T>
{
    "add": (value: T, index: number) => void;
    "remove": (value: T, index: number) => void;

    "clear": () => void;
}

/**
 * A wrapper class around the native {@link Array} class that provides additional functionality
 * for publishing events when entries are added, removed or the collection is cleared.
 * There are also complementary classes that work with the native `Map` and `Set` classes.
 * See also {@link MapView} and {@link SetView}.
 *
 * ---
 *
 * @example
 * ```ts
 * const array = new ArrayView<number>();
 *
 * array.onAdd((value: number, index: number) => console.log(`Added ${value} at index ${index}`));
 * array.push(42); // "Added 42 at index 0"
 * ```
 *
 * ---
 *
 * @template T The type of the values in the array.
 */
export default class ArrayView<T> extends Array<T>
{
    /**
     * The internal {@link Publisher} instance used to publish events.
     */
    protected readonly _publisher: Publisher<ArrayViewEventsMap<T>>;

    /**
     * Initializes a new instance of the {@link ArrayView} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>();
     * ```
     */
    public constructor();

    /**
     * Initializes a new instance of the {@link ArrayView} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>(3);
     * ```
     *
     * ---
     *
     * @param length The initial length of the {@link Array}.
     */
    public constructor(length: number);

    /**
     * Initializes a new instance of the {@link ArrayView} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>(2, 4, 8);
     * ```
     *
     * ---
     *
     * @param items The items to initialize the {@link Array} with.
     */
    public constructor(...items: T[]);
    public constructor(...items: T[])
    {
        super(...items);

        this._publisher = new Publisher();
    }

    /**
     * Appends new elements to the end of the {@link Array} and returns the new length of the array.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>();
     * array.push(2, 4, 8);
     *
     * console.log(array); // ArrayView(3) [2, 4, 8]
     * ```
     *
     * ---
     *
     * @param items New elements to add to the array.
     *
     * @returns The new length of the array.
     */
    public override push(...items: T[]): number
    {
        const startIndex = this.length;

        const result = super.push(...items);
        for (let i = 0; i < items.length; i += 1)
        {
            this._publisher.publish("add", items[i], startIndex + i);
        }

        return result;
    }

    /**
     * Removes the last element from the {@link Array} and returns it.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>(2, 4, 8);
     * array.pop(); // 8
     *
     * console.log(array); // ArrayView(2) [2, 4]
     * ```
     *
     * ---
     *
     * @returns The removed element, or `undefined` if the array is empty.
     */
    public override pop(): T | undefined
    {
        const index = this.length - 1;
        if (index < 0) { return undefined; }

        const value = super.pop();
        this._publisher.publish("remove", value!, index);

        return value;
    }

    /**
     * Removes the first element from the {@link Array} and returns it.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>(2, 4, 8);
     * array.shift(); // 2
     *
     * console.log(array); // ArrayView(2) [4, 8]
     * ```
     *
     * ---
     *
     * @returns The removed element, or `undefined` if the array is empty.
     */
    public override shift(): T | undefined
    {
        if (this.length === 0) { return undefined; }

        const value = super.shift();
        this._publisher.publish("remove", value!, 0);

        return value;
    }

    /**
     * Inserts new elements at the start of the {@link Array} and returns the new length of the array.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>(4, 8);
     * array.unshift(2);
     *
     * console.log(array); // ArrayView(3) [2, 4, 8]
     * ```
     *
     * ---
     *
     * @param items Elements to insert at the start of the array.
     *
     * @returns The new length of the array.
     */
    public override unshift(...items: T[]): number
    {
        const result = super.unshift(...items);
        for (let i = 0; i < items.length; i += 1)
        {
            this._publisher.publish("add", items[i], i);
        }

        return result;
    }

    /**
     * Removes elements from the {@link Array} and, if necessary, inserts new elements in their place,
     * returning the deleted elements.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>(2, 4, 8, 16);
     * array.splice(1, 2, 32, 64); // [4, 8]
     *
     * console.log(array); // ArrayView(4) [2, 32, 64, 16]
     * ```
     *
     * ---
     *
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items Elements to insert into the array in place of the deleted elements.
     *
     * @returns An array containing the elements that were deleted.
     */
    public override splice(start: number, deleteCount?: number, ...items: T[]): T[]
    {
        const normalizedStart = start < 0 ? Math.max(this.length + start, 0) : Math.min(start, this.length);

        const actualDeleteCount = deleteCount === undefined ?
            this.length - normalizedStart :
            Math.min(Math.max(deleteCount, 0), this.length - normalizedStart);

        const removed = super.splice(start, actualDeleteCount, ...items);
        for (let i = 0; i < removed.length; i += 1)
        {
            this._publisher.publish("remove", removed[i], normalizedStart + i);
        }

        for (let i = 0; i < items.length; i += 1)
        {
            this._publisher.publish("add", items[i], normalizedStart + i);
        }

        return removed;
    }

    /**
     * Removes all elements from the {@link Array}.
     *
     * ---
     *
     * @example
     * ```ts
     * const array = new ArrayView<number>(2, 4, 8);
     * array.clear();
     *
     * console.log(array); // ArrayView(0) []
     * ```
     */
    public clear(): void
    {
        const length = this.length;
        this.length = 0;

        if (length > 0) { this._publisher.publish("clear"); }
    }

    /**
     * Subscribes to the `add` event of the array with a callback that will be executed when an element is added.
     *
     * ---
     *
     * @example
     * ```ts
     * array.onAdd((value, index) => console.log(`Added ${value} at index ${index}`));
     *
     * array.push(2); // "Added 2 at index 0"
     * array.push(42); // "Added 42 at index 1"
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when an element is added to the array.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    public onAdd(callback: (value: T, index: number) => void): Callback
    {
        return this._publisher.subscribe("add", callback);
    }

    /**
     * Subscribes to the `remove` event of the array with a callback that will be executed when an element is removed.
     *
     * ---
     *
     * @example
     * ```ts
     * array.onRemove((value, index) => console.log(`Removed ${value} at index ${index}`));
     *
     * array.pop(); // "Removed 8 at index 2"
     * array.shift(); // "Removed 2 at index 0"
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when an element is removed from the array.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    public onRemove(callback: (value: T, index: number) => void): Callback
    {
        return this._publisher.subscribe("remove", callback);
    }

    /**
     * Subscribes to the `clear` event of the array with a callback that will be executed when the array is cleared.
     *
     * ---
     *
     * @example
     * ```ts
     * array.onClear(() => console.log("The array has been cleared."));
     * array.clear(); // "The array has been cleared."
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when the array is cleared.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    public onClear(callback: () => void): Callback
    {
        return this._publisher.subscribe("clear", callback);
    }

    public readonly [Symbol.toStringTag]: string = "ArrayView";
    public static override readonly [Symbol.species]: typeof Array = Array;
}
