import { describe, expect, it } from "vitest";

import { SmartIterator } from "../../../src/index.js";

describe("ReducedIterator", () =>
{
    it("Should return `true` if every value matches the predicate", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.every((key, value) => value > 0);
        expect(results).toBe(true);
    });
    it("Should return `false` if not every value matches the predicate", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, -3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.every((key, value) => value > 0);
        expect(results).toBe(false);
    });

    it("Should return `true` if some values match the predicate", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, -3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.some((key, value) => value > 0);
        expect(results).toBe(true);
    });
    it("Should return `false` if no values match the predicate", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, -2, -3, -5, 6, -8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.some((key, value) => value > 0);
        expect(results).toBe(false);
    });

    it("Should filter elements based on a condition", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, -3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.filter((key, value) => value > 0);
        expect(results.toObject()).toEqual({ even: 16 });
    });
    it("Should map elements using a transformation function", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, -3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.map((key, value) => Math.abs(value));
        expect(results.toObject()).toEqual({ odd: 2, even: 16 });
    });

    it("Should reduce elements using a reducer function", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.reduce((key, acc, value) => acc + value);
        expect(results).toBe(20);
    });
    it("Should reduce elements with an initial value", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.reduce<number>((key, acc, value) => acc + value, 10);
        expect(results).toBe(30);
    });

    it("Should flatten elements using a transformation function", () =>
    {
        const _initializer = (key: string) => key === "odd" ? [] : 0;
        const _reducer = (key: string, acc: number | number[], value: number) =>
        {
            if (key === "odd") { (acc as number[]).push(value); }
            else { (acc as number) += value; }

            return acc;

        };

        const results = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce<number | number[]>(_reducer, _initializer)
            .flatMap((key, value) => value);

        expect(results.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [16] });
    });

    it("Should drop a given number of elements", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.drop(1);
        expect(results.toObject()).toEqual({ even: 16 });
    });
    it("Should take a given number of elements", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.take(1);
        expect(results.toObject()).toEqual({ odd: 4 });
    });

    it("Should find the first element that satisfies a condition", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, -3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.find((key, value) => value > 0);
        expect(results).toBe(16);
    });
    it("Should return `undefined` when no matching value is found", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.find((key, value) => value < 0);
        expect(results).toBeUndefined();
    });

    it("Should enumerate elements", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.enumerate();
        expect(results.toObject()).toEqual({ odd: [0, 4], even: [1, 16] });
    });
    it("Should remove duplicate elements", () =>
    {
        const reduced = new SmartIterator([3, 1, 0, 2, 3, 6, 3, 1, 1, 5, 6, 8, 7, 2])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.unique();
        expect(results.toObject()).toEqual({ odd: 24 });
    });
    it("Should count the number of elements", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.count();
        expect(results).toBe(2);
    });

    it("Should iterate over all elements", () =>
    {
        const results: [string, number, number][] = [];
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        iterator.forEach((key, value, index) => { results.push([key, value, index]); });

        expect(results).toEqual([
            ["odd", 4, 0],
            ["even", 16, 1]
        ]);
    });

    it("Should reorganize elements by a new key", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, -3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.reorganizeBy((key, value) => value >= 0 ? "+" : "-");

        expect(results.toObject()).toEqual({ "-": [-2], "+": [16] });
    });

    it("Should return all keys", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const keys = reduced.keys();
        expect(keys.toArray()).toEqual(["odd", "even"]);
    });
    it("Should return all entries", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const entries = reduced.entries();
        expect(entries.toArray()).toEqual([
            ["odd", 4],
            ["even", 16]
        ]);
    });
    it("Should return all values", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const values = reduced.values();
        expect(values.toArray()).toEqual([4, 16]);
    });

    it("Should materialize the iterator into an array", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        expect(reduced.toArray()).toEqual([4, 16]);
    });

    it("Should materialize the iterator into a map", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        expect(reduced.toMap()).toEqual(new Map([
            ["odd", 4],
            ["even", 16]
        ]));
    });

    it("Should materialize the iterator into an object", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        expect(reduced.toObject()).toEqual({ odd: 4, even: 16 });
    });
});
