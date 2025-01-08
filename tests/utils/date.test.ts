import { describe, expect, test } from "vitest";

import { dateDifference, dateRange, dateRound, getWeek, WeekDay } from "../../src/index.js";
import { RangeException, TimeUnit } from "../../src/index.js";

describe("dateDifference", () =>
{
    test("years", () =>
    {
        expect(dateDifference("2024-03-01T12:23:34.456Z", "2020-02-28Z", TimeUnit.Year))
            .toBe(-4);
    });
    test("months", () =>
    {
        expect(dateDifference("2020-02-28Z", "2024-03-01T12:23:34.456Z", TimeUnit.Month))
            .toBe(4 * 12);
    });
    test("weeks", () =>
    {
        expect(dateDifference("2024-03-01T12:23:34.456Z", "2020-02-28Z", TimeUnit.Week))
            .toBe(-(4 * 52 + 1));
    });

    test("default", () =>
    {
        expect(dateDifference("2020-02-28Z", "2024-03-01T12:23:34.456Z"))
            .toBe(365 * 4 + 3);
    });

    test("days", () =>
    {
        expect(dateDifference("2024-03-01T12:23:34.456Z", "2020-02-28Z", TimeUnit.Day))
            .toBe(-(365 * 4 + 3));
    });
    test("hours", () =>
    {
        expect(dateDifference(new Date("2020-02-28Z"), "2024-03-01T12:23:34.456Z", TimeUnit.Hour))
            .toBe((365 * 4 + 3) * 24 + 12);
    });
    test("minutes", () =>
    {
        expect(dateDifference("2024-03-01T12:23:34.456Z", new Date("2020-02-28Z"), TimeUnit.Minute))
            .toBe(-(((365 * 4 + 3) * 24 + 12) * 60 + 23));
    });
    test("seconds", () =>
    {
        expect(dateDifference(new Date("2020-02-28Z"), new Date("2024-03-01T12:23:34.456Z"), TimeUnit.Second))
            .toBe((((365 * 4 + 3) * 24 + 12) * 60 + 23) * 60 + 34);
    });
    test("milliseconds", () =>
    {
        expect(dateDifference(new Date("2024-03-01T12:23:34.456Z"), new Date("2020-02-28Z"), TimeUnit.Millisecond))
            .toBe(-(((((365 * 4 + 3) * 24 + 12) * 60 + 23) * 60 + 34) * 1000 + 456));
    });
});

describe("dateRange", () =>
{
    test("years", () =>
    {
        expect([
            ...dateRange("2020-02-28Z", "2027-03-01T12:23:34.456Z", TimeUnit.Year * 3)
        ].map((date) => date.getTime()))
            .toEqual([1582848000000, 1677456000000, 1772064000000]);
    });
    test("months", () =>
    {
        expect([
            ...dateRange("2020-02-28T12:23:34.456Z", "2020-06-27Z", TimeUnit.Month)
        ].map((date) => date.getTime()))
            .toEqual([1582892614456, 1585484614456, 1588076614456, 1590668614456]);
    });
    test("weeks", () =>
    {
        expect([
            ...dateRange("2020-02-28Z", "2020-03-31T12:23:34.456Z", TimeUnit.Week)
        ].map((date) => date.getTime()))
            .toEqual([1582848000000, 1583452800000, 1584057600000, 1584662400000, 1585267200000]);
    });

    test("default", () =>
    {
        expect([
            ...dateRange("2020-02-28T12:23:34.456Z", "2020-03-02Z")
        ].map((date) => date.getTime()))
            .toEqual([1582892614456, 1582979014456, 1583065414456]);
    });
    test("default (exception)", () =>
    {
        expect(() => [...dateRange("2020-03-02Z", "2020-02-28T12:23:34.456Z")])
            .toThrowError(RangeException);
    });

    test("days", () =>
    {
        expect([
            ...dateRange("2020-02-28Z", "2020-03-31T12:23:34.456Z", TimeUnit.Day * 7)
        ].map((date) => date.getTime()))
            .toEqual([1582848000000, 1583452800000, 1584057600000, 1584662400000, 1585267200000]);
    });
    test("hours", () =>
    {
        expect([
            ...dateRange(new Date("2020-02-28T12:23:34.456Z"), "2020-02-28T18:00:00Z", TimeUnit.Hour * 2)
        ].map((date) => date.getTime()))
            .toEqual([1582892614456, 1582899814456, 1582907014456]);
    });
    test("minutes", () =>
    {
        expect([
            ...dateRange("2020-02-28T12:23:34.456Z", new Date("2020-02-28T12:28:33Z"), TimeUnit.Minute)
        ].map((date) => date.getTime()))
            .toEqual([1582892614456, 1582892674456, 1582892734456, 1582892794456, 1582892854456]);
    });
    test("seconds", () =>
    {
        expect([
            ...dateRange(new Date("2020-02-28T12:23:34.456Z"), new Date("2020-02-28T12:23:37Z"), TimeUnit.Second)
        ].map((date) => date.getTime()))
            .toEqual([1582892614456, 1582892615456, 1582892616456]);
    });
    test("milliseconds", () =>
    {
        expect([
            ...dateRange("2020-02-28T12:23:34.456Z", "2020-02-28T12:23:34.495Z", TimeUnit.Millisecond * 10)
        ].map((date) => date.getTime()))
            .toEqual([1582892614456, 1582892614466, 1582892614476, 1582892614486]);
    });
});

describe("dateRound", () =>
{
    test("years (exception)", () =>
    {
        expect(() => dateRound("2020-02-28T12:23:34.456Z", TimeUnit.Year))
            .toThrowError(RangeException);
    });
    test("months (exception)", () =>
    {
        expect(() => dateRound("2020-02-28T12:23:34.456Z", TimeUnit.Month))
            .toThrowError(RangeException);
    });
    test("weeks (exception)", () =>
    {
        expect(() => dateRound("2020-02-28T12:23:34.456Z", TimeUnit.Week))
            .toThrowError(RangeException);
    });

    test("default", () =>
    {
        expect(dateRound("2020-02-28T12:23:34.456Z").getTime())
            .toBe(1582848000000);
    });
    test("days", () =>
    {
        expect(dateRound("2020-02-28T12:23:34.456Z", TimeUnit.Day).getTime())
            .toBe(1582848000000);
    });
    test("hours", () =>
    {
        expect(dateRound("2020-02-28T12:23:34.456Z", TimeUnit.Hour).getTime())
            .toBe(1582891200000);
    });
    test("minutes", () =>
    {
        expect(dateRound("2020-02-28T12:23:34.456Z", TimeUnit.Minute).getTime())
            .toBe(1582892580000);
    });
    test("seconds", () =>
    {
        expect(dateRound("2020-02-28T12:23:34.456Z", TimeUnit.Second).getTime())
            .toBe(1582892614000);
    });
    test("milliseconds (exception)", () =>
    {
        expect(() => dateRound("2020-02-28T12:23:34.456Z", TimeUnit.Millisecond))
            .toThrowError(RangeException);
    });
});

describe("getWeek", () =>
{
    test("default", () =>
    {
        expect(getWeek("2020-02-28T12:23:34.456Z").getTime())
            .toBe(1582416000000);
    });
    test("monday", () =>
    {
        expect(getWeek("2020-02-28T12:23:34.456Z", WeekDay.Monday).getTime())
            .toBe(1582502400000);
    });
    test("tuesday", () =>
    {
        expect(getWeek(new Date("2020-02-28T12:23:34.456Z"), WeekDay.Tuesday).getTime())
            .toBe(1582588800000);
    });
    test("wednesday", () =>
    {
        expect(getWeek("2020-02-28T12:23:34.456Z", WeekDay.Wednesday).getTime())
            .toBe(1582675200000);
    });
    test("thursday", () =>
    {
        expect(getWeek(new Date("2020-02-28T12:23:34.456Z"), WeekDay.Thursday).getTime())
            .toBe(1582761600000);
    });
    test("friday", () =>
    {
        expect(getWeek("2020-02-28T12:23:34.456Z", WeekDay.Friday).getTime())
            .toBe(1582848000000);
    });
    test("saturday", () =>
    {
        expect(getWeek(new Date("2020-02-28T12:23:34.456Z"), WeekDay.Saturday).getTime())
            .toBe(1582329600000);
    });
    test("sunday", () =>
    {
        expect(getWeek(new Date("2020-02-28T12:23:34.456Z"), WeekDay.Sunday).getTime())
            .toBe(1582416000000);
    });
});
