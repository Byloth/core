import { describe, expect, it, vi } from "vitest";

import { SmartIterator } from "../../../src/index.js";

describe("AggregatedIterator", () =>
{
    it("Should check if every element in each group satisfies a condition", () =>
    {
        const aggregator = new SmartIterator([-4, -2, 1, 3, 5, 6, 7])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.every((key, value) => value >= 0);
        expect(results.toObject()).toEqual({ odd: true, even: false });
    });
    it("Should check if some elements in each group satisfy a condition", () =>
    {
        const aggregator = new SmartIterator([-5, -4, -3, -2, -1, 0])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.some((key, value) => value >= 0);
        expect(results.toObject()).toEqual({ odd: false, even: true });
    });

    it("Should filter elements based on a condition", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.filter((key, value) => value > 0);
        expect(results.toObject()).toEqual({ odd: [3, 5], even: [2, 6, 8] });
    });
    it("Should map elements using a transformation function", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.map((key, value) => Math.abs(value));
        expect(results.toObject()).toEqual({ odd: [3, 1, 3, 5], even: [0, 2, 6, 8] });
    });

    it("Should reduce elements using a reducer function", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.reduce((key, acc, value) => acc + value);
        expect(results.toObject()).toEqual({ odd: 4, even: 16 });
    });
    it("Should reduce elements using a reducer function with an initial value", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.reduce<number>((key, acc, value) => acc + value, 10);
        expect(results.toObject()).toEqual({ odd: 14, even: 26 });
    });
    it("Should reduce elements using a reducer function with a function that returns an initial value", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.reduce<number>((key, acc, value) => acc + value, (key) => key === "odd" ? 10 : 0);
        expect(results.toObject()).toEqual({ odd: 14, even: 16 });
    });

    it("Should flatten elements using a transformation function", () =>
    {
        const aggregator = new SmartIterator([[-3, -1], 0, 2, 3, 5, [6, 8]])
            .groupBy((values) =>
            {
                const value = values instanceof Array ? values[0] : values;
                return value % 2 === 0 ? "even" : "odd";
            });

        const results = aggregator.flatMap((key, values) => values);
        expect(results.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
    });

    it("Should drop a given number of elements from the beginning of each group", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.drop(2);
        expect(results.toObject()).toEqual({ odd: [3, 5], even: [6, 8] });
    });
    it("Should take a given number of elements from the beginning of each group", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.take(2);
        expect(results.toObject()).toEqual({ odd: [-3, -1], even: [0, 2] });
    });

    it("Should find the first element of each group that satisfies a condition", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.find((key, value) => value > 5);
        expect(results.toObject()).toEqual({ odd: undefined, even: 6 });
    });

    it("Should enumerate the elements with their indices within each group", () =>
    {
        const aggregator = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.enumerate();
        expect(results.toObject()).toEqual({ odd: [[0, -3], [1, -1], [2, 3]], even: [[0, 0], [1, 2]] });
    });
    it("Should remove all duplicate elements within each group", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 6, -3, -1, 0, 5, 6, 8, 0, 2])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.unique();
        expect(results.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
    });
    it("Should count the number of elements within each group", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.count();
        expect(results.toObject()).toEqual({ odd: 4, even: 4 });
    });

    it("Should iterate over all elements", () =>
    {
        const results: [string, number, number][] = [];
        const _iteratee = vi.fn((key: string, value: number, index: number) => results.push([key, value, index]));

        const iterator = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        iterator.forEach(_iteratee);

        expect(results).toEqual([["odd", -3, 0], ["even", 0, 0], ["even", 2, 1], ["odd", -1, 1], ["odd", 3, 2]]);
        expect(_iteratee).toHaveBeenCalledTimes(5);
    });

    it("Should change the key of each element on which the iterator is aggregated", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = aggregator.map((key, value, index) => index % 2 === 0 ? value : -value)
            .reorganizeBy((key, value) => value >= 0 ? "+" : "-");

        expect(results.toObject()).toEqual({ "+": [1, 0, 3, 6], "-": [-3, -2, -5, -8] });
    });

    it("Should return all keys", () =>
    {
        const aggregator = new SmartIterator([-3, Symbol(), "A", { }, null, [1, 2, 3], false])
            .groupBy((value) => typeof value);

        const keys = aggregator.keys();
        expect(keys.toArray()).toEqual(["number", "symbol", "string", "object", "boolean"]);
    });
    it("Should return all entries", () =>
    {
        const aggregator = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const entries = aggregator.entries();
        expect(entries.toArray()).toEqual([
            ["odd", -3],
            ["even", 0],
            ["even", 2],
            ["odd", -1],
            ["odd", 3]
        ]);
    });
    it("Should return all values", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const values = aggregator.values();
        expect(values.toArray()).toEqual([-3, -1, 0, 2, 3, 5, 6, 8]);
    });

    it("Should materialize the iterator into an array of arrays", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        expect(aggregator.toArray()).toEqual([[-3, -1, 3, 5], [0, 2, 6, 8]]);
    });
    it("Should materialize the iterator into a map", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        expect(aggregator.toMap()).toEqual(new Map([
            ["odd", [-3, -1, 3, 5]],
            ["even", [0, 2, 6, 8]]
        ]));
    });
    it("Should materialize the iterator into an object", () =>
    {
        const aggregator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        expect(aggregator.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
    });
});
