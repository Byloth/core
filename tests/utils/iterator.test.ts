import { describe, expect, it } from "vitest";

import { RangeException, SmartIterator } from "../../src/index.js";
import { chain, count, enumerate, range, shuffle, unique, zip } from "../../src/index.js";

describe("chain", () =>
{
    it("Should return an instance of `SmartIterator`", () =>
    {
        const iterator = chain([1, 2, 3], [4, 5, 6]);

        expect(iterator).toBeInstanceOf(SmartIterator);
    });
    it("Should chain multiple iterables into a single one", () =>
    {
        const results = Array.from(chain([1, 2, 3], [4, 5, 6], [7, 8, 9]));

        expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});

describe("count", () =>
{
    it("Should count the number of elements in an iterable", () =>
    {
        expect(count([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toBe(10);
        expect(count(new Set([1, 2, 3, 4, 5]))).toBe(5);
    });
});

describe("enumerate", () =>
{
    it("Should return an instance of `SmartIterator`", () =>
    {
        const iterator = enumerate(["A", "M", "N", "Z"]);

        expect(iterator).toBeInstanceOf(SmartIterator);
    });
    it("Should enumerate the elements of an iterable", () =>
    {
        const results = Array.from(enumerate(["A", "M", "N", "Z"]));

        expect(results).toEqual([[0, "A"], [1, "M"], [2, "N"], [3, "Z"]]);
    });
});

describe("range", () =>
{
    it("Should return an instance of `SmartIterator`", () =>
    {
        const iterator = range(5);

        expect(iterator).toBeInstanceOf(SmartIterator);
    });

    it("Should throw `RangeException` if step is lower than or equal to 0", () =>
    {
        expect(() => range(2, 7, 0)).toThrow(RangeException);
        expect(() => range(5, 0, -1)).toThrow(RangeException);
    });

    it("Should generate an iterator over a range of numbers", () =>
    {
        expect(Array.from(range(5))).toEqual([0, 1, 2, 3, 4]);
        expect(Array.from(range(2, 7))).toEqual([2, 3, 4, 5, 6]);
    });
    it("Should generate an iterator over a range of numbers with a specified step", () =>
    {
        expect(Array.from(range(0, 10, 2))).toEqual([0, 2, 4, 6, 8]);
        expect(Array.from(range(2, 13, 3))).toEqual([2, 5, 8, 11]);
    });

    it("Should generate an iterator over a range of numbers in reverse", () =>
    {
        expect(Array.from(range(5, 0))).toEqual([5, 4, 3, 2, 1]);
        expect(Array.from(range(7, 2))).toEqual([7, 6, 5, 4, 3]);
    });
    it("Should generate an iterator over a range of numbers in reverse with a specified step", () =>
    {
        expect(Array.from(range(10, 0, 2))).toEqual([10, 8, 6, 4, 2]);
        expect(Array.from(range(13, 2, 3))).toEqual([13, 10, 7, 4]);
    });
});

describe("shuffle", () =>
{
    it("Should shuffle the elements of an iterable", () =>
    {
        const array = [1, 2, 3, 4, 5];
        const shuffled = shuffle(array);

        expect(shuffled).toHaveLength(array.length);
        expect(new Set(shuffled)).toEqual(new Set(array));
    });
});

describe("unique", () =>
{
    it("Should return an instance of `SmartIterator`", () =>
    {
        const iterator = unique([1, 1, 2, 3, 2, 3, 4, 5, 5, 4]);

        expect(iterator).toBeInstanceOf(SmartIterator);
    });
    it("Should filter the elements of an iterable ensuring they are all unique", () =>
    {
        const results = Array.from(unique([1, 1, 2, 3, 2, 3, 4, 5, 5, 4]));

        expect(results).toEqual([1, 2, 3, 4, 5]);
    });
});

describe("zip", () =>
{
    it("Should return an instance of `SmartIterator`", () =>
    {
        const iterator = zip([1, 2, 3, 4], ["A", "M", "N", "Z"]);

        expect(iterator).toBeInstanceOf(SmartIterator);
    });
    it("Should zip two iterables into a single one", () =>
    {
        const results = Array.from(zip([1, 2, 3, 4], ["A", "M", "N", "Z"]));

        expect(results).toEqual([[1, "A"], [2, "M"], [3, "N"], [4, "Z"]]);
    });
});
