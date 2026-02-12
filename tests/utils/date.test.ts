import { describe, expect, it } from "vitest";

import { RangeException, SmartIterator } from "../../src/index.js";
import { TimeUnit, WeekDay, dateDifference, dateRange, dateRound, getWeek } from "../../src/index.js";

describe("TimeUnit", () =>
{
    it("Should have correct conversion factors", () =>
    {
        expect(TimeUnit.Millisecond).toBe(1);
        expect(TimeUnit.Second).toBe(1000);
        expect(TimeUnit.Minute).toBe(60 * TimeUnit.Second);
        expect(TimeUnit.Hour).toBe(60 * TimeUnit.Minute);
        expect(TimeUnit.Day).toBe(24 * TimeUnit.Hour);
        expect(TimeUnit.Week).toBe(7 * TimeUnit.Day);
        expect(TimeUnit.Month).toBe(30 * TimeUnit.Day);
        expect(TimeUnit.Year).toBe(365 * TimeUnit.Day);
    });
});

describe("WeekDay", () =>
{
    it("Should have correct day values", () =>
    {
        expect(WeekDay.Sunday).toBe(0);
        expect(WeekDay.Monday).toBe(1);
        expect(WeekDay.Tuesday).toBe(2);
        expect(WeekDay.Wednesday).toBe(3);
        expect(WeekDay.Thursday).toBe(4);
        expect(WeekDay.Friday).toBe(5);
        expect(WeekDay.Saturday).toBe(6);
    });
});

describe("dateDifference", () =>
{
    it("Should calculate the difference in days by default", () =>
    {
        const start = new Date("2025-01-01");
        const end = "2025-01-31";

        expect(dateDifference(start, end)).toBe(30);
    });
    it("Should calculate the difference in specified `TimeUnit`", () =>
    {
        const start = "2025-01-01";
        const end = new Date("2025-01-31").getTime();

        expect(dateDifference(start, end, TimeUnit.Minute)).toBe(43200);
    });

    it("Should return negative difference if start date is after end date", () =>
    {
        const start = new Date("2025-01-31").getTime();
        const end = new Date("2025-01-01");

        expect(dateDifference(start, end)).toBe(-30);
    });
});

describe("dateRange", () =>
{
    it("Should return an instance of `SmartIterator`", () =>
    {
        const start = new Date("2025-01-01");
        const end = "2025-01-05";

        const iterator = dateRange(start, end);

        expect(iterator).toBeInstanceOf(SmartIterator);
    });

    it("Should generate dates in the specified range", () =>
    {
        const start = "2025-01-01";
        const end = new Date("2025-01-05").getTime();
        const iterator = dateRange(start, end);
        const dates = Array.from(iterator);

        expect(dates).toHaveLength(4);

        expect(dates[0].toISOString().slice(0, 10)).toBe("2025-01-01");
        expect(dates[3].toISOString().slice(0, 10)).toBe("2025-01-04");
    });

    it("Should throw `RangeException` if start date isn't less than end date", () =>
    {
        const start = new Date("2025-01-05").getTime();
        const end = "2025-01-01";

        expect(() => dateRange(start, end)).toThrow(RangeException);
    });
});

describe("dateRound", () =>
{
    it("Should round date to the previous time unit", () =>
    {
        const date = new Date("2025-01-01T12:34:56.789Z");

        expect(dateRound(date, TimeUnit.Hour).toISOString()).toBe("2025-01-01T12:00:00.000Z");
    });

    it("Should throw `RangeException` if unit is less than or equal to a millisecond", () =>
    {
        const date = "2025-01-01T12:34:56.789Z";

        expect(() => dateRound(date, TimeUnit.Millisecond)).toThrow(RangeException);
    });
    it("Should throw `RangeException` if unit is greater than a day", () =>
    {
        const date = new Date("2025-01-01T12:34:56.789Z").getTime();

        expect(() => dateRound(date, TimeUnit.Week)).toThrow(RangeException);
    });
});

describe("getWeek", () =>
{
    it("Should get the first day of the week for the specified date", () =>
    {
        const date = "2025-01-01";

        expect(getWeek(date, WeekDay.Monday).toISOString()
            .slice(0, 10)).toBe("2024-12-30");
    });
    it("Should get the first day of the week for the specified date with default first day", () =>
    {
        const date = new Date("2025-01-01").getTime();

        expect(getWeek(date).toISOString()
            .slice(0, 10)).toBe("2024-12-29");
    });
});
