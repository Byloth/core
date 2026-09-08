import { describe, expect, it } from "vitest";

import { ValueException } from "../../src/index.js";
import { average, clamp, lerp, smoothstep, sum } from "../../src/index.js";

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

describe("clamp", () =>
{
    it("Should clamp a value between the specified bounds", () =>
    {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-3, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
    });
    it("Should throw `ValueException` if the minimum bound is greater than the maximum bound", () =>
    {
        expect(() => clamp(5, 10, 0)).toThrow(ValueException);
    });
});

describe("lerp", () =>
{
    it("Should interpolate between two values", () =>
    {
        expect(lerp(0, 10, 0.5)).toBe(5);
        expect(lerp(10, 0, 0.25)).toBe(7.5);
    });
    it("Should return the bounds for a ratio of `0` and `1`", () =>
    {
        expect(lerp(3, 7, 0)).toBe(3);
        expect(lerp(3, 7, 1)).toBe(7);
    });
    it("Should extrapolate for ratios outside `[0, 1]`", () =>
    {
        expect(lerp(0, 10, 2)).toBe(20);
        expect(lerp(0, 10, -1)).toBe(-10);
    });
});

describe("smoothstep", () =>
{
    it("Should interpolate smoothly between the bounds", () =>
    {
        expect(smoothstep(0, 1, 0)).toBe(0);
        expect(smoothstep(0, 1, 0.25)).toBe(0.15625);
        expect(smoothstep(0, 1, 0.5)).toBe(0.5);
        expect(smoothstep(0, 1, 1)).toBe(1);
    });
    it("Should clamp values outside the bounds", () =>
    {
        expect(smoothstep(0, 1, -3)).toBe(0);
        expect(smoothstep(0, 1, 7)).toBe(1);
    });
    it("Should work with arbitrary bounds", () =>
    {
        expect(smoothstep(10, 20, 15)).toBe(0.5);
        expect(smoothstep(10, 20, 25)).toBe(1);
    });

    it("Should throw `ValueException` if the minimum bound is greater than the maximum bound", () =>
    {
        expect(() => smoothstep(1, 0, 0.5))
            .toThrow(ValueException);
    });
    it("Should throw `ValueException` if the bounds are equal", () =>
    {
        expect(() => smoothstep(1, 1, 0.5))
            .toThrow(ValueException);
    });
});

describe("sum", () =>
{
    it("Should sum all the values of a given list", () =>
    {
        expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });
});
