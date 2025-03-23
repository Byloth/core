
import { RangeException, SmartIterator } from "../models/index.js";

/**
 * An enumeration that represents the time units and their conversion factors.  
 * It can be used as utility to express time values in a more
 * readable way or to convert time values between different units.
 *
 * ---
 *
 * @example
 * ```ts
 * setTimeout(() => { [...] }, 5 * TimeUnit.Minute);
 * ```
 */
export enum TimeUnit
{
    /* eslint-disable @typescript-eslint/prefer-literal-enum-member */

    /**
     * A millisecond: the base time unit.
     */
    Millisecond = 1,

    /**
     * A second: 1000 milliseconds.
     */
    Second = 1_000,

    /**
     * A minute: 60 seconds.
     */
    Minute = 60 * Second,

    /**
     * An hour: 60 minutes.
     */
    Hour = 60 * Minute,

    /**
     * A day: 24 hours.
     */
    Day = 24 * Hour,

    /**
     * A week: 7 days.
     */
    Week = 7 * Day,

    /**
     * A month: 30 days.
     */
    Month = 30 * Day,

    /**
     * A year: 365 days.
     */
    Year = 365 * Day
}

/**
 * An enumeration that represents the days of the week.  
 * It can be used as utility to identify the days of the week when working with dates.
 *
 * ---
 *
 * @example
 * ```ts
 * const today = new Date();
 * if (today.getUTCDay() === WeekDay.Sunday)
 * {
 *     // Today is Sunday. Do something...
 * }
 * ```
 */
export enum WeekDay
{
    /**
     * Sunday
     */
    Sunday = 0,

    /**
     * Monday
     */
    Monday = 1,

    /**
     * Tuesday
     */
    Tuesday = 2,

    /**
     * Wednesday
     */
    Wednesday = 3,

    /**
     * Thursday
     */
    Thursday = 4,

    /**
     * Friday
     */
    Friday = 5,

    /**
     * Saturday
     */
    Saturday = 6
}

/**
 * An utility function that calculates the difference between two dates.  
 * The difference can be expressed in different time units.
 *
 * ---
 *
 * @example
 * ```ts
 * const start = new Date("2025-01-01");
 * const end = new Date("2025-01-31");
 *
 * dateDifference(start, end, TimeUnit.Minute); // 43200
 * ```
 *
 * ---
 *
 * @param start The start date.
 * @param end The end date.
 * @param unit The time unit to express the difference. `TimeUnit.Day` by default.
 *
 * @returns The difference between the two dates in the specified time unit.
 */
export function dateDifference(start: string | Date, end: string | Date, unit = TimeUnit.Day): number
{
    let _round: (value: number) => number;

    start = new Date(start);
    end = new Date(end);

    if (start < end) { _round = Math.floor; }
    else { _round = Math.ceil; }

    return _round((end.getTime() - start.getTime()) / unit);
}

/**
 * An utility function that generates an iterator over a range of dates.  
 * The step between the dates can be expressed in different time units.
 *
 * ---
 *
 * @example
 * ```ts
 * const start = new Date("2025-01-01");
 * const end = new Date("2025-01-31");
 *
 * for (const date of dateRange(start, end, TimeUnit.Week))
 * {
 *     date.toISOString().slice(8, 10); // "01", "08", "15", "22", "29"
 * }
 * ```
 *
 * ---
 *
 * @param start The start date (included).
 * @param end
 * The end date (excluded).
 *
 * Must be greater than the start date. Otherwise, a {@link RangeException} will be thrown.
 *
 * @param step The time unit to express the step between the dates. `TimeUnit.Day` by default.
 *
 * @returns A {@link SmartIterator} object that generates the dates in the range.
 */
export function dateRange(start: string | Date, end: string | Date, step = TimeUnit.Day): SmartIterator<Date>
{
    if (start >= end) { throw new RangeException("The end date must be greater than the start date."); }

    return new SmartIterator<Date>(function* ()
    {
        const endTime = new Date(end).getTime();

        let unixTime: number = new Date(start).getTime();
        while (unixTime < endTime)
        {
            yield new Date(unixTime);

            unixTime += step;
        }
    });
}

/**
 * An utility function that rounds a date to the nearest time unit.  
 * The rounding can be expressed in different time units.
 *
 * ---
 *
 * @example
 * ```ts
 * const date = new Date("2025-01-01T12:34:56.789Z");
 *
 * dateRound(date, TimeUnit.Hour); // 2025-01-01T12:00:00.000Z
 * ```
 *
 * ---
 *
 * @param date The date to round.
 * @param unit
 * The time unit to express the rounding. `TimeUnit.Day` by default.
 *
 * Must be greater than a millisecond and less than or equal to a day.  
 * Otherwise, a {@link RangeException} will be thrown.
 *
 * @returns The rounded date.
 */
export function dateRound(date: string | Date, unit = TimeUnit.Day): Date
{
    if (unit <= TimeUnit.Millisecond)
    {
        throw new RangeException(
            "Rounding a timestamp by milliseconds or less makes no sense." +
            "Use the timestamp value directly instead."
        );
    }
    if (unit > TimeUnit.Day)
    {
        throw new RangeException(
            "Rounding by more than a day leads to unexpected results. " +
            "Consider using other methods to round dates by weeks, months or years."
        );
    }

    date = new Date(date);
    return new Date(Math.floor(date.getTime() / unit) * unit);
}

/**
 * An utility function that gets the week of a date.  
 * The first day of the week can be optionally specified.
 *
 * ---
 *
 * @example
 * ```ts
 * const date = new Date("2025-01-01");
 *
 * getWeek(date, WeekDay.Monday); // 2024-12-30
 * ```
 *
 * ---
 *
 * @param date The date to get the week of.
 * @param firstDay The first day of the week. `WeekDay.Sunday` by default.
 *
 * @returns The first day of the week of the specified date.
 */
export function getWeek(date: string | Date, firstDay = WeekDay.Sunday): Date
{
    date = new Date(date);

    const startCorrector = 7 - firstDay;
    const weekDayIndex = (date.getUTCDay() + startCorrector) % 7;
    const firstDayTime = date.getTime() - (TimeUnit.Day * weekDayIndex);

    return dateRound(new Date(firstDayTime));
}
