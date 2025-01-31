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
        expect(results).toEqual(true);
    });
    it("Should return `false` if not every value matches the predicate", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, -3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.every((key, value) => value > 0);
        expect(results).toEqual(false);
    });

    it("Should return `true` if some values match the predicate", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, -3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.some((key, value) => value > 0);
        expect(results).toEqual(true);
    });
    it("Should return `false` if no values match the predicate", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, -2, -3, -5, 6, -8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.some((key, value) => value > 0);
        expect(results).toEqual(false);
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
        expect(results).toEqual(20);
    });
    it("Should reduce elements with an initial value", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd")
            .reduce((key, acc, value) => acc + value);

        const results = reduced.reduce<number>((key, acc, value) => acc + value, 10);
        expect(results).toEqual(30);
    });

    //
    // TODO: Continue from here!
    //

    it("Should flatten elements using a transformation function", () =>
    {
        const reduced = new SmartIterator([[-3, -1], 0, 2, 3, 5, [6, 8]])
            .groupBy((values) =>
            {
                const value = values instanceof Array ? values[0] : values;
                return value % 2 === 0 ? "even" : "odd";
            });

        const results = reduced.flatMap((key, values) => values);
        expect(results.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
    });

    it("Should drop a given number of elements", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = reduced.drop(2);
        expect(results.toObject()).toEqual({ odd: [3, 5], even: [6, 8] });
    });
    it("Should take a given number of elements", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = reduced.take(2);
        expect(results.toObject()).toEqual({ odd: [-3, -1], even: [0, 2] });
    });

    it("Should find the first element that satisfies a condition", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = reduced.find((key, value) => value > 0);
        expect(results.toObject()).toEqual({ odd: 3, even: 2 });
    });

    it("Should enumerate elements", () =>
    {
        const reduced = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = reduced.enumerate();
        expect(results.toObject()).toEqual({ odd: [[0, -3], [1, -1], [2, 3]], even: [[0, 0], [1, 2]] });
    });
    it("Should remove duplicate elements", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 6, -3, -1, 0, 5, 6, 8, 0, 2])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = reduced.unique();
        expect(results.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
    });
    it("Should count the number of elements", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = reduced.count();
        expect(results.toObject()).toEqual({ odd: 4, even: 4 });
    });

    it("Should iterate over all elements", () =>
    {
        const results: [string, number, number][] = [];
        const iterator = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        iterator.forEach((key, value, index) => { results.push([key, value, index]); });

        expect(results).toEqual([
            ["odd", -3, 0],
            ["even", 0, 0],
            ["even", 2, 1],
            ["odd", -1, 1],
            ["odd", 3, 2]
        ]);
    });

    it("Should reorganize elements by a new key", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const results = reduced.map((key, value, index) => index % 2 === 0 ? value : -value)
            .reorganizeBy((key, value) => value >= 0 ? "+" : "-");

        expect(results.toObject()).toEqual({ "+": [1, 0, 3, 6], "-": [-3, -2, -5, -8] });
    });

    it("Should return all keys", () =>
    {
        const reduced = new SmartIterator([-3, Symbol(), "A", { }, null, [1, 2, 3], false])
            .groupBy((value) => typeof value);

        const keys = reduced.keys();
        expect(keys.toArray()).toEqual(["number", "symbol", "string", "object", "boolean"]);
    });
    it("Should return all entries", () =>
    {
        const reduced = new SmartIterator([-3, 0, 2, -1, 3])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const entries = reduced.entries();
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
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        const values = reduced.values();
        expect(values.toArray()).toEqual([-3, -1, 0, 2, 3, 5, 6, 8]);
    });

    it("Should materialize the iterator into an array", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        expect(reduced.toArray()).toEqual([[-3, -1, 3, 5], [0, 2, 6, 8]]);
    });

    it("Should materialize the iterator into a map", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        expect(reduced.toMap()).toEqual(new Map([
            ["odd", [-3, -1, 3, 5]],
            ["even", [0, 2, 6, 8]]
        ]));
    });

    it("Should materialize the iterator into an object", () =>
    {
        const reduced = new SmartIterator([-3, -1, 0, 2, 3, 5, 6, 8])
            .groupBy((value) => value % 2 === 0 ? "even" : "odd");

        expect(reduced.toObject()).toEqual({ odd: [-3, -1, 3, 5], even: [0, 2, 6, 8] });
    });
});
