import type { Comparator } from "./types.js";

/**
 * A binary min-heap over a single array, ordered by a {@link Comparator} provided by the caller:
 * the element the comparator places first is the one {@link BinaryHeap.pop} extracts.
 * It's the priority queue behind schedulers, event queues ordered by time and pathfinding open sets.
 *
 * Also note that:
 * - It isn't stable: elements the comparator considers equal pop in an order decided by the sifting
 *   algorithm, not by their insertion order. For deterministic pops, the comparator must be a total order.
 * - The sifting algorithm is fixed: elements sift up while strictly less than their parent, and sift down
 *   towards the strictly smaller child, the left one when both are equal.
 * - {@link BinaryHeap.push} and {@link BinaryHeap.pop} run in `O(log n)` and allocate nothing.
 *
 * ---
 *
 * @example
 * ```ts
 * interface Task { priority: number, name: string }
 *
 * const compare: Comparator<Task> = (a, b) => a.priority - b.priority;
 * const queue = new BinaryHeap<Task>(compare);
 *
 * queue.push({ priority: 2, name: "Render" });
 * queue.push({ priority: 1, name: "Update" });
 *
 * queue.pop(); // { priority: 1, name: "Update" }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the heap.
 */
export default class BinaryHeap<T>
{
    protected readonly _compare: Comparator<T>;

    protected readonly _items: T[];

    /**
     * The number of elements in the heap.
     */
    public get size(): number { return this._items.length; }

    /**
     * Initializes a new instance of the {@link BinaryHeap} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const heap = new BinaryHeap<number>((a, b) => a - b);
     * ```
     *
     * ---
     *
     * @param compare The {@link Comparator} deciding the order of the elements: the one placed first pops first.
     */
    public constructor(compare: Comparator<T>)
    {
        this._compare = compare;

        this._items = [];
    }

    /**
     * Returns the element that would be extracted next, without removing it.
     *
     * ---
     *
     * @example
     * ```ts
     * console.log(heap.peek()); // The minimum element, or `undefined` if the heap is empty.
     * ```
     *
     * ---
     *
     * @returns The first element of the heap, or `undefined` if the heap is empty.
     */
    public peek(): T | undefined { return this._items[0]; }

    /**
     * Adds an element to the heap.
     *
     * ---
     *
     * @example
     * ```ts
     * heap.push(42);
     * ```
     *
     * ---
     *
     * @param item The element to add.
     */
    public push(item: T): void
    {
        const items = this._items;

        let index = items.length;
        items.push(item);

        while (index > 0)
        {
            const parentIndex = (index - 1) >> 1;
            const parent = items[parentIndex];
            if (this._compare(item, parent) >= 0) { break; }

            items[index] = parent;
            index = parentIndex;
        }

        items[index] = item;
    }

    /**
     * Extracts the first element of the heap.
     *
     * ---
     *
     * @example
     * ```ts
     * while (heap.size)
     * {
     *     const item = heap.pop();
     *
     *     [...]
     * }
     * ```
     *
     * ---
     *
     * @returns The first element of the heap, or `undefined` if the heap is empty.
     */
    public pop(): T | undefined
    {
        const items = this._items;
        if (items.length === 0) { return undefined; }

        const top = items[0];
        const last = items.pop()!;

        const length = items.length;
        if (length === 0) { return top; }

        let index = 0;
        while (true)
        {
            let childIndex = (index * 2) + 1;
            if (childIndex >= length) { break; }

            const rightIndex = childIndex + 1;
            if ((rightIndex < length) && (this._compare(items[rightIndex], items[childIndex]) < 0))
            {
                childIndex = rightIndex;
            }

            const child = items[childIndex];
            if (this._compare(child, last) >= 0) { break; }

            items[index] = child;
            index = childIndex;
        }

        items[index] = last;

        return top;
    }

    /**
     * Removes every element from the heap.
     *
     * ---
     *
     * @example
     * ```ts
     * heap.clear();
     * ```
     */
    public clear(): void { this._items.length = 0; }

    public readonly [Symbol.toStringTag]: string = "BinaryHeap";
}
