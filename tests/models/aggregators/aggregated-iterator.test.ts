import { describe, expect, it } from "vitest";

import { SmartIterator } from "../../../src/index.js";

describe("AggregatedIterator", () =>
{
    it("Should check if every element in each group satisfies a condition", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 7])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .every((key, value) => value >= 0);

        expect(iterator.toObject()).toEqual({ odd: true, even: false });
    });
    it("Should check if some elements in each group satisfy a condition", () =>
    {
        const iterator = new SmartIterator([-5, -4, -3, -2, -1, 0])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .some((key, value) => value >= 0);

        expect(iterator.toObject()).toEqual({ odd: false, even: true });
    });

    it("Should filter elements by a condition", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .filter((key, value) => value >= 0);

        expect(iterator.toObject()).toEqual({ odd: [3, 5], even: [0, 2, 6, 8] });
    });
    it("Should map elements using a transformation function", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .map((key, value) => Math.abs(value));

        expect(iterator.toObject()).toEqual({ odd: [3, 1, 3, 5], even: [0, 2, 6, 8] });
    });
    it("Should reduce elements using a reducer function", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, accumulator, value) => accumulator + value);

        expect(iterator.toObject()).toEqual({ odd: 4, even: 16 });
    });

    it("Should flatten elements using a transformation function", () =>
    {
        const iterator = new SmartIterator([[-3, -1], 0, 2, 3, 5, [6, 8]])
            .groupBy(([value, _]) => value % 2 === 0 ? "even" : "odd")
            .flatMap((key, values) => values);

        expect(iterator.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
    });

    it("Should group elements by key and count them", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .count();

        expect(iterator.toObject()).toEqual({ odd: 4, even: 4 });
    });

    it("Should drop a given number of elements from the beginning of each group", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .drop(2);

        expect(iterator.toObject()).toEqual({ odd: [3, 5], even: [6, 8] });
    });

    it("Should take a given number of elements from the beginning of each group", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .take(2);

        expect(iterator.toObject()).toEqual({ odd: [-3, -1], even: [0, 2] });
    });

    it("Should find the first element of each group that satisfies a condition", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .find((key, value) => value > 0);

        expect(iterator.toObject()).toEqual({ odd: 3, even: 2 });
    });

    it("Should enumerate the elements of the iterator", () =>
    {
        const iterator = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .enumerate();

        expect(iterator.toObject()).toEqual({ odd: [[0, -3], [1, -1], [2, 3]], even: [[0, 0], [1, 2]] });
    });

    it("Should remove all duplicate elements from within each group", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 6, -3, -1, 0, 5, 6, 8, 0, 2])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .unique();

        expect(iterator.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
    });

    it("Should count the number of elements within each group", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .count();

        expect(iterator.toObject()).toEqual({ odd: 4, even: 4 });
    });

    it("Should iterate over the elements of the iterator", () =>
    {
        const iterator = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results: [string, number, number][] = [];
        iterator.forEach((key, value, index) =>
        {
            results.push([key, value, index]);
        });

        expect(results).toEqual([
            ["odd", -3, 0],
            ["even", 0, 0],
            ["even", 2, 1],
            ["odd", -1, 1],
            ["odd", 3, 2]
        ]);
    });

    it("Should change the key of each element on which the iterator is aggregated", () =>
    {
        const iterator = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .map((key, value, index) => index % 2 === 0 ? value : -value)
            .reorganizeBy((key, value) => value >= 0 ? "+" : "-");

        expect(iterator.toObject()).toEqual({ "+": [0, 3, 6], "-": [-3, -2, -5, -8] });
    });

    it("Should return all keys of the iterator", () =>
    {
        const keys = new SmartIterator([-3, Symbol(), "A", {}, null, [1, 2, 3], false])
            .groupBy((value) => typeof value)
            .keys();

        expect(keys.toArray()).toEqual(["number", "symbol", "string", "object", "boolean"]);
    });

    it("Should return all entries of the iterator", () =>
    {
        const entries = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .entries();

        expect(entries.toArray()).toEqual([
            ["odd", -3],
            ["even", 0],
            ["even", 2],
            ["odd", -1],
            ["odd", 3]
        ]);
    });

    it("Should return all values of the iterator", () =>
    {
        const values = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .values();

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
