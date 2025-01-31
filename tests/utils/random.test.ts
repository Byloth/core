import { describe, expect, it } from "vitest";

import { ValueException } from "../../src/index.js";
import { Random } from "../../src/index.js";

describe("Random", () =>
{
    describe("Boolean", () =>
    {
        it("Should return a boolean value", () =>
        {
            const result = Random.Boolean();

            expect(typeof result).toBe("boolean");
        });

        it("Should return true approximately 50% of the time with default ratio", () =>
        {
            const results = Array.from({ length: 1000 }, () => Random.Boolean());
            const trueCount = results.filter(Boolean).length;

            expect(trueCount).toBeGreaterThan(400);
            expect(trueCount).toBeLessThan(600);
        });
        it("Should return true approximately 70% of the time with ratio 0.7", () =>
        {
            const results = Array.from({ length: 1000 }, () => Random.Boolean(0.7));
            const trueCount = results.filter(Boolean).length;

            expect(trueCount).toBeGreaterThan(650);
            expect(trueCount).toBeLessThan(750);
        });
    });

    describe("Integer", () =>
    {
        it("Should return an integer between 0 and max (exclusive)", () =>
        {
            const max = 5;
            const result = Random.Integer(max);

            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(max);
        });
        it("Should return an integer between min and max (exclusive)", () =>
        {
            const min = 2;
            const max = 7;
            const result = Random.Integer(min, max);

            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThan(max);
        });
    });

    describe("Decimal", () =>
    {
        it("Should return a decimal between 0 and 1 (exclusive)", () =>
        {
            const result = Random.Decimal();

            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(1);
        });
        it("Should return a decimal between 0 and max (exclusive)", () =>
        {
            const max = 5;
            const result = Random.Decimal(max);

            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(max);
        });
        it("Should return a decimal between min and max (exclusive)", () =>
        {
            const min = 2;
            const max = 7;
            const result = Random.Decimal(min, max);

            expect(result).toBeGreaterThanOrEqual(min);
            expect(result).toBeLessThan(max);
        });
    });

    describe("Index", () =>
    {
        it("Should return a valid index from the array", () =>
        {
            const elements = [1, 2, 3, 4, 5];
            const index = Random.Index(elements);

            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(elements.length);
        });

        it("Should throw `ValueException` if the array is empty", () =>
        {
            expect(() => Random.Index([])).toThrow(ValueException);
        });
    });

    describe("Choice", () =>
    {
        it("Should return a random element from the array", () =>
        {
            const elements = [1, 2, 3, 4, 5];
            const choice = Random.Choice(elements);

            expect(elements).toContain(choice);
        });

        it("Should throw `ValueException` if the array is empty", () =>
        {
            expect(() => Random.Choice([])).toThrow(ValueException);
        });
    });
});
