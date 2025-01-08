import { describe, it, expect } from "vitest";

import { SmartIterator, ValueException } from "../../src/index.js";
import { Curve } from "../../src/index.js";

describe("Curve", () =>
{
    describe("Linear", () =>
    {
        it("Should return an instance of `SmartIterator`", () =>
        {
            const iterator = Curve.Linear(5);

            expect(iterator).toBeInstanceOf(SmartIterator);
        });
        it("Should generate a linear sequence of values", () =>
        {
            const values = Array.from(Curve.Linear(5));

            expect(values).toEqual([0, 0.25, 0.5, 0.75, 1]);
        });
    });

    describe("Exponential", () =>
    {
        it("Should return an instance of `SmartIterator`", () =>
        {
            const iterator = Curve.Exponential(6);

            expect(iterator).toBeInstanceOf(SmartIterator);
        });

        it("Should generate an exponential sequence of values with default base", () =>
        {
            const values = Array.from(Curve.Exponential(6));

            expect(values).toEqual([0, 0.04000000000000001, 0.16000000000000003, 0.36, 0.6400000000000001, 1]);
        });
        it("Should generate an exponential sequence of values with custom base", () =>
        {
            const values = Array.from(Curve.Exponential(6, 3));

            expect(values).toEqual(
                [0, Math.pow(1 / 5, 3), Math.pow(2 / 5, 3), Math.pow(3 / 5, 3), Math.pow(4 / 5, 3), 1]
            );
        });

        it("Should throw a `ValueException` if base is negative", () =>
        {
            expect(() => Curve.Exponential(6, -1)).toThrow(ValueException);
        });
    });
});
