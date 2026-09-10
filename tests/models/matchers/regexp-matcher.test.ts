import { describe, expect, it, vi } from "vitest";

import { RegExpMatcher } from "../../../src/index.js";

describe("RegExpMatcher", () =>
{
    it("Should return the value of the first matching pattern, in registration order", () =>
    {
        const matcher = new RegExpMatcher()
            .on(/Chrome\//, () => "generic")
            .on(/Edg\//, () => "specific");

        expect(matcher.match("Chrome/120 Edg/120")).toBe("generic");
    });
    it("Should register several patterns for the same callback", () =>
    {
        const matcher = new RegExpMatcher()
            .on([/iPhone/, /iPad/], () => "iOS");

        expect(matcher.match("iPhone OS 17")).toBe("iOS");
        expect(matcher.match("iPad; CPU OS 17")).toBe("iOS");
    });
    it("Should pass the execution results, captures included, to the callback", () =>
    {
        const _callback = vi.fn((results: RegExpExecArray) => results[1]);
        const matcher = new RegExpMatcher()
            .on(/Version\/([\d.]+)/, _callback);

        expect(matcher.match("Version/17.1 Safari/605.1.15")).toBe("17.1");
        expect(_callback).toHaveBeenCalledTimes(1);
    });
    it("Should return the default value when nothing matches", () =>
    {
        const matcher = new RegExpMatcher()
            .on(/Firefox/, () => "Gecko")
            .default(() => "unknown");

        expect(matcher.match("curl/8.4.0")).toBe("unknown");
    });
    it("Should return `undefined` when nothing matches and no default is set", () =>
    {
        const matcher = new RegExpMatcher()
            .on(/Firefox/, () => "Gecko");

        expect(matcher.match("curl/8.4.0")).toBeUndefined();
    });
    it("Should reset global patterns between tests", () =>
    {
        const matcher = new RegExpMatcher()
            .on(/a/g, () => true)
            .default(() => false);

        expect(matcher.match("a")).toBe(true);
        expect(matcher.match("a")).toBe(true);
    });
    it("Should allow nested matchers", () =>
    {
        const matcher = new RegExpMatcher()
            .on(/Safari\//, (): string => new RegExpMatcher()
                .on(/CriOS\//, () => "Chrome for iOS")
                .default(() => "Safari")
                .match("CriOS/120 Safari/604.1"))
            .default(() => "unknown");

        expect(matcher.match("Safari/604.1")).toBe("Chrome for iOS");
    });
});
