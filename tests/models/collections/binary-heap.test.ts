import { describe, expect, it } from "vitest";

import { BinaryHeap, Random } from "../../../src/index.js";
import type { Comparator } from "../../../src/index.js";

interface Task
{
    priority: number;
    name: string;
}

const _ascending: Comparator<number> = (a, b) => (a - b);
const _drain = <T>(heap: BinaryHeap<T>): T[] =>
{
    const items: T[] = [];
    while (heap.size) { items.push(heap.pop()!); }

    return items;
};

describe("BinaryHeap", () =>
{
    it("Should pop the elements in the order defined by the comparator", () =>
    {
        const rng = Random.FromSeed(42);
        const values = Array.from({ length: 500 }, () => rng.integer(1000));

        const heap = new BinaryHeap(_ascending);
        for (const value of values) { heap.push(value); }

        expect(heap.size).toBe(500);

        expect(_drain(heap)).toEqual([...values].sort(_ascending));
        expect(heap.size).toBe(0);
    });
    it("Should peek the first element without removing it", () =>
    {
        const heap = new BinaryHeap(_ascending);
        heap.push(3);
        heap.push(1);
        heap.push(2);

        expect(heap.peek()).toBe(1);
        expect(heap.size).toBe(3);
        expect(heap.pop()).toBe(1);
        expect(heap.peek()).toBe(2);
    });
    it("Should return `undefined` when peeking or popping an empty heap", () =>
    {
        const heap = new BinaryHeap(_ascending);

        expect(heap.peek()).toBeUndefined();
        expect(heap.pop()).toBeUndefined();
    });
    it("Should be empty and reusable after `clear`", () =>
    {
        const heap = new BinaryHeap(_ascending);
        heap.push(2);
        heap.push(1);
        heap.clear();

        expect(heap.size).toBe(0);
        expect(heap.pop()).toBeUndefined();

        heap.push(5);
        heap.push(4);

        expect(_drain(heap)).toEqual([4, 5]);
    });
    it("Should behave as a max-heap with a reversed comparator", () =>
    {
        const heap = new BinaryHeap<number>((a, b) => (b - a));
        for (const value of [3, 9, 1, 7, 5]) { heap.push(value); }

        expect(_drain(heap)).toEqual([9, 7, 5, 3, 1]);
    });
    it("Should order objects through a comparator on one of their fields", () =>
    {
        const heap = new BinaryHeap<Task>((a, b) => (a.priority - b.priority));
        heap.push({ priority: 2, name: "Render" });
        heap.push({ priority: 1, name: "Update" });
        heap.push({ priority: 3, name: "Sleep" });

        expect(_drain(heap).map((task) => task.name)).toEqual(["Update", "Render", "Sleep"]);
    });
    it("Should always pop the current minimum while interleaving pushes and pops", () =>
    {
        const rng = Random.FromSeed(1);
        const heap = new BinaryHeap(_ascending);
        const mirror: number[] = [];

        for (let step = 0; step < 300; step += 1)
        {
            if ((mirror.length === 0) || (rng.decimal() < 0.6))
            {
                const value = rng.integer(100);

                heap.push(value);
                mirror.push(value);
            }
            else
            {
                mirror.sort(_ascending);

                expect(heap.pop()).toBe(mirror.shift());
            }
        }
    });
    it("Should keep the pop order among equal elements stable across releases", () =>
    {
        const rng = Random.FromSeed(7);
        const heap = new BinaryHeap<{ key: number, index: number }>((a, b) => (a.key - b.key));
        for (let index = 0; index < 24; index += 1) { heap.push({ key: rng.integer(4), index: index }); }

        expect(_drain(heap).map((item) => item.index))
            .toEqual([0, 1, 7, 20, 22, 11, 23, 14, 15, 16, 18, 10, 5, 6, 4, 9, 13, 3, 8, 17, 21, 2, 19, 12]);
    });
});
