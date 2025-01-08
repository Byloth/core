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
    test("years", () =>
    {
        expect([...dateRange("2020-02-28", "2024-03-01T12:23:34.456Z", TimeUnit.Year)].map((date) => date.getTime()))
            .toEqual([1582848000000, 1614384000000, 1645920000000, 1677456000000, 1708992000000]);
    });
    test("months", () =>
    {
        expect([...dateRange("2020-02-28T12:23:34.456Z", "2020-06-27", TimeUnit.Month)].map((date) => date.getTime()))
            .toEqual([1582892614456, 1585484614456, 1588076614456, 1590668614456]);
    });
    test("weeks", () =>
    {
        expect([...dateRange("2020-02-28", "2020-03-31T12:23:34.456Z", TimeUnit.Week)].map((date) => date.getTime()))
            .toEqual([1582848000000, 1583452800000, 1584057600000, 1584662400000, 1585267200000]);
    });

    test("default", () =>
    {
        expect([...dateRange("2020-02-28T12:23:34.456Z", "2020-03-02")].map((date) => date.getTime()))
            .toEqual([1582892614456, 1582979014456, 1583065414456]);
    });

    test("days", () =>
    {
        expect([...dateRange("2020-02-28", "2020-03-02T12:23:34.456Z", TimeUnit.Day)].map((date) => date.getTime()))
            .toEqual([1582848000000, 1582934400000, 1583020800000, 1583107200000]);
    });
    test("hours", () =>
    {
        expect([
            ...dateRange(new Date("2020-02-28T12:23:34.456Z"), "2020-02-28T18:00:00", TimeUnit.Hour)
        ].map((date) => date.getTime()))
            .toEqual([1582892614456, 1582896214456, 1582899814456, 1582903414456, 1582907014456]);
    });
});
