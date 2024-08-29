import { SmartIterator } from "../models/index.js";

export enum TimeUnit
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

export function dateDifference(start: string | Date, end: string | Date, unit = TimeUnit.Day): number
{
    start = new Date(start);
    end = new Date(end);

    return Math.floor((end.getTime() - start.getTime()) / unit);
}

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
