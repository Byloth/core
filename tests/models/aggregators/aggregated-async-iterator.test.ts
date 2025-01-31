import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { delay } from "../../../src/index.js";

import { SmartAsyncIterator } from "../../../src/index.js";

describe("AggregatedAsyncIterator", () =>
{
    const _toAsync = <T>(elements: Iterable<T>) =>
    {
        return async function* ()
        {
            for (const element of elements)
            {
                await delay(100);

                yield element;
            }
        };
    };

    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.clearAllTimers());

    it("Should check if every element in each group satisfies a condition", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-4, -2, 1, 3, 5, 6, 7]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.every(async (key, value) => value >= 0)
            .then((results) =>
            {
                resolved = true;

                expect(results.toObject()).toEqual({ odd: true, even: false });
            });

        await vi.advanceTimersByTimeAsync(600);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should check if some elements in each group satisfy a condition", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-5, -4, -3, -2, -1, 0]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.some(async (key, value) => value >= 0)
            .then((results) =>
            {
                resolved = true;

                expect(results.toObject()).toEqual({ odd: false, even: true });
            });

        await vi.advanceTimersByTimeAsync(500);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should filter elements based on a condition", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .filter(async (key, value) => value >= 0);

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ odd: [3, 5], even: [0, 2, 6, 8] });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should map elements using a transformation function", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .map(async (key, value) => Math.abs(value));

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ odd: [3, 1, 3, 5], even: [0, 2, 6, 8] });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should reduce elements using a reducer function", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.reduce(async (key, acc, value) => acc + value)
            .then((result) =>
            {
                resolved = true;

                expect(result.toObject()).toEqual({ odd: 4, even: 16 });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should reduce elements using a reducer function with an initial value", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.reduce<number>(async (key, acc, value) => acc + value, 10)
            .then((result) =>
            {
                resolved = true;

                expect(result.toObject()).toEqual({ odd: 14, even: 26 });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should reduce elements using a reducer function with a function that returns an initial value", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;

        const reducer = async (key: string, acc: number, value: number) => acc + value;
        const initializer = async (key: string) => key === "odd" ? 10 : 0;
        aggregator.reduce<number>(reducer, initializer)
            .then((result) =>
            {
                resolved = true;

                expect(result.toObject()).toEqual({ odd: 14, even: 16 });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should flatten elements using a transformation function", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([[-3, -1], 0, 2, 3, 5, [6, 8]]))
            .groupBy(async (values) =>
            {
                const value = values instanceof Array ? values[0] : values;
                return value % 2 === 0 ? "even" : "odd";
            })
            .flatMap(async (key, values) => values);

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
            });

        await vi.advanceTimersByTimeAsync(500);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should drop a given number of elements from the beginning of each group", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .drop(2);

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ odd: [3, 5], even: [6, 8] });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should take a given number of elements from the beginning of each group", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .take(2);

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ odd: [-3, -1], even: [0, 2] });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should find the first element that satisfies a condition", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.find(async (key, value) => value >= 0)
            .then((result) =>
            {
                resolved = true;

                expect(result.toObject()).toEqual({ odd: 3, even: 0 });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should enumerate elements", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, 0, 2, -1, 3]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .enumerate();

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ odd: [[0, -3], [1, -1], [2, 3]], even: [[0, 0], [1, 2]] });
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should remove duplicate elements", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 6, -3, -1, 0, 5, 6, 8, 0, 2]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .unique();

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
            });

        await vi.advanceTimersByTimeAsync(1_300);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should group elements by key and count them", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.count()
            .then((result) =>
            {
                resolved = true;

                expect(result.toObject()).toEqual({ odd: 4, even: 4 });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should iterate over the elements of the iterator", async () =>
    {
        const results: [string, number, number][] = [];
        const aggregator = new SmartAsyncIterator(_toAsync([-3, 0, 2, -1, 3]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.forEach(async (key, value, index) => { results.push([key, value, index]); })
            .then(() =>
            {
                resolved = true;

                expect(results).toEqual([
                    ["odd", -3, 0],
                    ["even", 0, 0],
                    ["even", 2, 1],
                    ["odd", -1, 1],
                    ["odd", 3, 2]
                ]);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should reorganize elements by a new key", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .map(async (key, value, index) => index % 2 === 0 ? value : -value)
            .reorganizeBy(async (key, value) => value >= 0 ? "+" : "-");

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ "+": [1, 0, 3, 6], "-": [-3, -2, -5, -8] });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should return all keys of the iterator", async () =>
    {
        const keys = new SmartAsyncIterator(_toAsync([-3, Symbol(), "A", { }, null, [1, 2, 3], false]))
            .groupBy(async (value) => typeof value)
            .keys();

        let resolved = false;
        keys.toArray()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual(["number", "symbol", "string", "object", "boolean"]);
            });

        await vi.advanceTimersByTimeAsync(600);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should return all entries of the iterator", async () =>
    {
        const entries = new SmartAsyncIterator(_toAsync([-3, 0, 2, -1, 3]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .entries();

        let resolved = false;
        entries.toArray()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual([
                    ["odd", -3],
                    ["even", 0],
                    ["even", 2],
                    ["odd", -1],
                    ["odd", 3]
                ]);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should return all values of the iterator", async () =>
    {
        const values = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd")
            .values();

        let resolved = false;
        values.toArray()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual([-3, -1, 0, 2, 3, 5, 6, 8]);
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should materialize the iterator into an array of arrays", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.toArray()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual([[-3, -1, 3, 5], [0, 2, 6, 8]]);
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should materialize the iterator into a map", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.toMap()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual(new Map([
                    ["odd", [-3, -1, 3, 5]],
                    ["even", [0, 2, 6, 8]]
                ]));
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should materialize the iterator into an object", async () =>
    {
        const aggregator = new SmartAsyncIterator(_toAsync([-3, -1, 0, 2, 3, 5, 6, 8]))
            .groupBy(async (value) => value % 2 === 0 ? "even" : "odd");

        let resolved = false;
        aggregator.toObject()
            .then((result) =>
            {
                resolved = true;

                expect(result).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
            });

        await vi.advanceTimersByTimeAsync(700);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
});
