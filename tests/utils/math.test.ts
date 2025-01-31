import { describe, expect, it } from "vitest";

import { ValueException } from "../../src/index.js";
import { average, hash, sum } from "../../src/index.js";

describe("average", () =>
{
    it("Should compute the average of a list of values", () =>
    {
        expect(average([1, 2, 3, 4, 5])).toBe(3);
    });
    it("Should compute the weighted average of a list of values", () =>
    {
        expect(average([6, 8.5, 4], [3, 2, 1])).toBe(6.5);
    });

    it("Should throw `ValueException` if no values are provided", () =>
    {
        expect(() => average([])).toThrow(ValueException);
    });
    it("Should throw `ValueException` if weights are provided and one of them is zero or negative", () =>
    {
        expect(() => average([1, 2, 3], [1, 0, 1])).toThrow(ValueException);
        expect(() => average([1, 2, 3], [1, -1, 1])).toThrow(ValueException);
    });
    it("Should throw `ValueException` if the sum of weights isn't greater than zero", () =>
    {
        expect(() => average([1, 2, 3], [0, 0, 0])).toThrow(ValueException);
    });
});

describe("hash", () =>
{
    it("Should compute the hash of a given string", () =>
    {
        expect(hash("Hello, world!")).toBe(-1880044555);
        expect(hash("How are you?")).toBe(1761539132);
    });
});

describe("sum", () =>
{
    it("Should sum all the values of a given list", () =>
    {
        expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });
});
