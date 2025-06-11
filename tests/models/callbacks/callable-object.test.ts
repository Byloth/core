import { describe, expect, it } from "vitest";

import { CallableObject } from "../../../src/index.js";

class Multiply extends CallableObject<(arg: number) => number>
{
    public readonly multiplier;

    public constructor(multiplier = 2)
    {
        super();

        this.multiplier = multiplier;
    }

    protected _invoke(value: number): number
    {
        return value * this.multiplier;
    }
}

describe("CallableObject", () =>
{
    it("Should be callable and return the correct result", () =>
    {
        const multiply = new Multiply();

        const result = multiply(5);
        expect(result).toBe(10);
    });
    it("Should bind the correct context", () =>
    {
        const multiply = new Multiply(3);

        const result = multiply(6);
        expect(result).toBe(18);
    });
});
