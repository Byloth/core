import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { delay } from "../../src/index.js";
import { SmartAsyncIterator } from "../../src/index.js";

describe("SmartAsyncIterator", () =>
{
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.clearAllTimers());

    it("Should initialize with an iterable", async () =>
    {
        const _iterable = [1, 2, 3];

        const iterator = new SmartAsyncIterator(_iterable);
        expect(await iterator.toArray()).toEqual([1, 2, 3]);
    });
    it("Should initialize with an iterator", async () =>
    {
        const _iterator = {
            _index: 0,

            next: async function()
            {
                await delay(100);

                if (this._index < 3)
                {
                    this._index += 1;

                    return { done: false, value: this._index };
                }

                return { done: true, value: undefined };
            }
        };

        const iterator = new SmartAsyncIterator(_iterator);

        let resolved = false;
        iterator.toArray()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual([1, 2, 3]);
            });

        await vi.advanceTimersByTimeAsync(300);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should initialize with a generator function", async () =>
    {
        const _generatorFn = async function* ()
        {
            await delay(100);
            yield 1;

            await delay(100);
            yield 2;

            await delay(100);
            yield 3;

            await delay(100);
        };

        const iterator = new SmartAsyncIterator(_generatorFn);

        let resolved = false;
        iterator.toArray()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual([1, 2, 3]);
            });

        await vi.advanceTimersByTimeAsync(300);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should map values correctly", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const results = iterator.map(async (value) => value * 2);
        expect(await results.toArray()).toEqual([2, 4, 6, 8, 10]);
    });

    it("Should filter values correctly", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const results = iterator.filter(async (value) => value % 2 === 0);
        expect(await results.toArray()).toEqual([2, 4]);
    });

    it("Should reduce values correctly", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const results = await iterator.reduce(async (acc, value) => acc + value, 0);
        expect(results).toBe(15);
    });

    it("Should find the first matching value", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const results = await iterator.find(async (value) => value > 3);
        expect(results).toBe(4);
    });

    it("Should return true if every value matches the predicate", async () =>
    {
        const iterator = new SmartAsyncIterator([2, 4, 6, 8, 10]);
        const results = await iterator.every(async (value) => value % 2 === 0);
        expect(results).toBe(true);
    });

    it("Should return true if some values match the predicate", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const results = await iterator.some(async (value) => value > 3);
        expect(results).toBe(true);
    });

    it("Should drop the specified number of elements", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const results = iterator.drop(3);
        expect(await results.toArray()).toEqual([4, 5]);
    });

    it("Should take the specified number of elements", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const results = iterator.take(3);
        expect(await results.toArray()).toEqual([1, 2, 3]);
    });

    it("Should enumerate elements correctly", async () =>
    {
        const iterator = new SmartAsyncIterator(["A", "B", "C"]);
        const results = iterator.enumerate();
        expect(await results.toArray()).toEqual([[0, "A"], [1, "B"], [2, "C"]]);
    });

    it("Should remove duplicate elements", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 1, 2, 3, 2, 3, 4, 5, 5, 4]);
        const results = iterator.unique();
        expect(await results.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it("Should count the number of elements", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const results = await iterator.count();
        expect(results).toBe(5);
    });

    it("Should iterate over elements with forEach", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5]);
        const values: number[] = [];
        await iterator.forEach(async (value) =>
        {
            values.push(value);
        });
        expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    it("Should flatten elements with flatMap", async () =>
    {
        const iterator = new SmartAsyncIterator([[1, 2], [3, 4], [5]]);
        const results = iterator.flatMap(async (value) => value);
        expect(await results.toArray()).toEqual([1, 2, 3, 4, 5]);
    });

    it("Should group elements by key", async () =>
    {
        const iterator = new SmartAsyncIterator([1, 2, 3, 4, 5, 6]);
        const results = iterator.groupBy(async (value) => (value % 2 === 0 ? "even" : "odd"));
        const grouped = await results.toObject();
        expect(grouped).toEqual({
            odd: [1, 3, 5],
            even: [2, 4, 6]
        });
    });
});
