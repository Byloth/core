import { describe, expect, it } from "vitest";

import { capitalize } from "../../src/index.js";

describe("capitalize", () =>
{
    it("Should capitalize the first letter of a string", () =>
    {
        expect(capitalize("hello")).toBe("Hello");
    });
    it("Should handle strings that are already capitalized", () =>
    {
        expect(capitalize("Hello")).toBe("Hello");
    });
    it("Should not change the case of other letters", () =>
    {
        expect(capitalize("hELLo")).toBe("HELLo");
    });

    it("Should return an empty string if input is an empty string", () =>
    {
        expect(capitalize("")).toBe("");
    });
    it("Should handle single character strings", () =>
    {
        expect(capitalize("a")).toBe("A");
    });
    it("Should handle strings with special characters", () =>
    {
        expect(capitalize("!hello")).toBe("!hello");
    });
});
