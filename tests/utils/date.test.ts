import { describe, expect, test } from "vitest";

import { dateDifference, dateRange, TimeUnit } from "../../src/index.js";

describe("dateDifference", () =>
{
    test("years", () =>
    {
        expect(dateDifference("2024-03-01T12:23:34.456Z", "2020-02-28", TimeUnit.Year))
            .toBe(-4);
    });
    test("months", () =>
    {
        expect(dateDifference("2020-02-28", "2024-03-01T12:23:34.456Z", TimeUnit.Month))
            .toBe(4 * 12);
    });
    test("weeks", () =>
    {
        expect(dateDifference("2024-03-01T12:23:34.456Z", "2020-02-28", TimeUnit.Week))
            .toBe(-(4 * 52 + 1));
    });

    test("default", () =>
    {
        expect(dateDifference("2020-02-28", "2024-03-01T12:23:34.456Z"))
            .toBe(365 * 4 + 3);
    });
    test("days", () =>
    {
        expect(dateDifference("2024-03-01T12:23:34.456Z", "2020-02-28", TimeUnit.Day))
            .toBe(-(365 * 4 + 3));
    });
    test("hours", () =>
    {
        expect(dateDifference(new Date("2020-02-28"), "2024-03-01T12:23:34.456Z", TimeUnit.Hour))
            .toBe((365 * 4 + 3) * 24 + 12);
    });
    test("minutes", () =>
    {
        expect(dateDifference("2024-03-01T12:23:34.456Z", new Date("2020-02-28"), TimeUnit.Minute))
            .toBe(-(((365 * 4 + 3) * 24 + 12) * 60 + 23));
    });
    test("seconds", () =>
    {
        expect(dateDifference(new Date("2020-02-28"), new Date("2024-03-01T12:23:34.456Z"), TimeUnit.Second))
            .toBe((((365 * 4 + 3) * 24 + 12) * 60 + 23) * 60 + 34);
    });
    test("milliseconds", () =>
    {
        expect(dateDifference(new Date("2024-03-01T12:23:34.456Z"), new Date("2020-02-28"), TimeUnit.Millisecond))
            .toBe(-(((((365 * 4 + 3) * 24 + 12) * 60 + 23) * 60 + 34) * 1000 + 456));
    });
});

describe("dateRange", () =>
{
    test("default", () =>
    {
        const range = dateRange("2020-02-28", "2020-03-02");

        expect(range.next().value).toBeInstanceOf(Date);
        expect(range.next().value).toBeInstanceOf(Date);
        expect(range.next().value).toBeInstanceOf(Date);
        expect(range.next().value).toBeUndefined();
    });
});
