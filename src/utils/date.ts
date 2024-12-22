
import { SmartIterator } from "../models/index.js";

/**
 * An enumeration that represents the time units and their conversion factors.  
 * It can be used as utility to express time values in a more
 * readable way or to convert time values between different units.
 *
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
    Second = 1000,

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
    start = new Date(start);
    end = new Date(end);

    return Math.floor((end.getTime() - start.getTime()) / unit);
}

/**
 * An utility function that generates a range of dates between two dates.  
 * The range can be expressed in different time units.
 *
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
 * @param start 
 * @param end 
 * @param offset 
 * @returns 
 */
export function dateRange(start: string | Date, end: string | Date, offset = TimeUnit.Day): SmartIterator<Date>
{
    start = new Date(start);
    end = new Date(end);

    return new SmartIterator<Date>(function* ()
    {
        const endTime = end.getTime();

        let unixTime: number = start.getTime();
        while (unixTime < endTime)
        {
            yield new Date(unixTime);

            unixTime += offset;
        }
    });
}

export function dateRound(date: string | Date, unit = TimeUnit.Day): Date
{
    date = new Date(date);

    return new Date(Math.floor(date.getTime() / unit) * unit);
}

export function getWeek(date: string | Date, firstDay = WeekDay.Sunday): Date
{
    date = new Date(date);

    const startCorrector = 7 - firstDay;
    const weekDayIndex = (date.getUTCDay() + startCorrector) % 7;
    const firstDayTime = date.getTime() - (TimeUnit.Day * weekDayIndex);

    return dateRound(new Date(firstDayTime));
}
