import { describe, expect, it } from "vitest";

import { Hash } from "../../src/index.js";

describe("Hash", () =>
{
    describe("String", () =>
    {
        it("Should compute the hash of a given string", () =>
        {
            expect(Hash.String("Hello, world!")).toBe(-1880044555);
            expect(Hash.String("How are you?")).toBe(1761539132);
        });
    });

    describe("Integer", () =>
    {
        it("Should return a 32-bit signed integer", () =>
        {
            const value = Hash.Integer(42, 1, 2);

            expect(Number.isInteger(value)).toBe(true);
            expect(value).toBeGreaterThanOrEqual(-2_147_483_648);
            expect(value).toBeLessThanOrEqual(2_147_483_647);
        });
        it("Should produce stable values", () =>
        {
            expect(Hash.Integer()).toBe(1613774213);
            expect(Hash.Integer(0)).toBe(-1719451872);
            expect(Hash.Integer(42)).toBe(371697672);
            expect(Hash.Integer(42, 1, 2)).toBe(-868739727);
            expect(Hash.Integer(-1, 2_147_483_647)).toBe(545961873);
        });
        it("Should depend on the order of the values", () =>
        {
            expect(Hash.Integer(42, 2, 1)).toBe(-1591390021);
            expect(Hash.Integer(42, 2, 1)).not.toBe(Hash.Integer(42, 1, 2));
        });
        it("Should truncate numbers to integers", () =>
        {
            expect(Hash.Integer(1.9, 2.1)).toBe(Hash.Integer(1, 2));
        });
        it("Should hash strings before mixing them", () =>
        {
            expect(Hash.Integer("yaw")).toBe(Hash.Integer(Hash.String("yaw")));
            expect(Hash.Integer("yaw")).toBe(817570911);
            expect(Hash.Integer("yaw")).not.toBe(Hash.String("yaw"));
            expect(Hash.Integer(42, "a")).not.toBe(Hash.Integer(42, "b"));
        });
    });

    describe("Decimal", () =>
    {
        it("Should produce stable values", () =>
        {
            expect(Hash.Decimal(42, 1, 2)).toBe(0.797730770194903);
        });
        it("Should always be within the `[0, 1)` range", () =>
        {
            for (let index = -50; index < 50; index += 1)
            {
                const value = Hash.Decimal(42, index, index * 7, "salt");

                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThan(1);
            }
        });
        it("Should be derived from `Hash.Integer`", () =>
        {
            expect(Hash.Decimal(42, 1, 2)).toBe((Hash.Integer(42, 1, 2) >>> 0) / 4294967296);
        });
    });
});
