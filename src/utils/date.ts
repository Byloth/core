import { SmartIterator } from "../models/index.js";

export enum DateUnit
{
    Millisecond = 1,
    Second = 1000,
    Minute = 60 * Second,
    Hour = 60 * Minute,
    Day = 24 * Hour,
    Week = 7 * Day,
    Month = 30 * Day,
    Year = 365 * Day
}

export function dateDifference(start: Date, end: Date, unit = DateUnit.Day): number
{
    return Math.floor((end.getTime() - start.getTime()) / unit);
}

export function dateRange(start: Date, end: Date, offset = DateUnit.Day): SmartIterator<Date>
{
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

export function dateRound(date: Date, unit = DateUnit.Day): Date
{
    return new Date(Math.floor(date.getTime() / unit) * unit);
}
