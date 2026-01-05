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

    describe("Sample", () =>
    {
        describe("Without weights", () =>
        {
            it("Should return an array with the specified number of elements from the original array", () =>
            {
                const elements = [1, 2, 3, 4, 5];
                const sample = Random.Sample(elements, 3);

                expect(sample).toHaveLength(3);

                for (const element of sample)
                {
                    expect(elements).toContain(element);
                }
            });

            it("Should return unique elements (no replacement)", () =>
            {
                const elements = [1, 2, 3, 4, 5];
                const sample = Random.Sample(elements, 5);

                const uniqueElements = new Set(sample);
                expect(uniqueElements.size).toBe(5);
            });
            it("Should return an empty array when count is 0", () =>
            {
                const elements = [1, 2, 3, 4, 5];
                const sample = Random.Sample(elements, 0);

                expect(sample).toHaveLength(0);
            });
            it("Should return all elements when count equals length", () =>
            {
                const elements = [1, 2, 3, 4, 5];
                const sample = Random.Sample(elements, 5);

                expect(sample).toHaveLength(5);
                expect(sample.sort()).toEqual(elements.sort());
            });

            it("Should throw `ValueException` if the array is empty", () =>
            {
                expect(() => Random.Sample([], 1)).toThrow(ValueException);
            });
            it("Should throw `ValueException` if count is negative", () =>
            {
                expect(() => Random.Sample([1, 2, 3], -1)).toThrow(ValueException);
            });
            it("Should throw `ValueException` if count exceeds array length", () =>
            {
                expect(() => Random.Sample([1, 2, 3], 5)).toThrow(ValueException);
            });
        });

        describe("With weights", () =>
        {
            it("Should return an array with the specified number of elements from the original array", () =>
            {
                const elements = ["a", "b", "c"];
                const weights = [1, 1, 1];
                const sample = Random.Sample(elements, 2, weights);

                expect(sample).toHaveLength(2);

                for (const element of sample)
                {
                    expect(elements).toContain(element);
                }
            });

            it("Should return unique elements (no replacement)", () =>
            {
                const elements = ["a", "b", "c", "d", "e"];
                const weights = [1, 2, 3, 4, 5];
                const sample = Random.Sample(elements, 5, weights);

                const uniqueElements = new Set(sample);

                expect(uniqueElements.size).toBe(5);
            });
            it("Should favor elements with higher weights", () =>
            {
                const elements = ["rare", "common"];
                const weights = [1, 100];

                let commonFirstCount = 0;
                for (let i = 0; i < 1000; i += 1)
                {
                    const sample = Random.Sample(elements, 1, weights);

                    if (sample[0] === "common") { commonFirstCount += 1; }
                }

                expect(commonFirstCount).toBeGreaterThan(900);
            });

            it("Should throw `ValueException` if weights length differs from elements length", () =>
            {
                expect(() => Random.Sample([1, 2, 3], 2, [1, 1])).toThrow(ValueException);
            });
            it("Should throw `ValueException` if any weight is zero", () =>
            {
                expect(() => Random.Sample([1, 2, 3], 2, [1, 0, 1])).toThrow(ValueException);
            });
            it("Should throw `ValueException` if any weight is negative", () =>
            {
                expect(() => Random.Sample([1, 2, 3], 2, [1, -1, 1])).toThrow(ValueException);
            });
        });
    });
});
