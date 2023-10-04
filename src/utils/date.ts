export enum DateUnit
{
    Second = 1000,
    Minute = 60 * Second,
    Hour = 60 * Minute,
    Day = 24 * Hour,
    Week = 7 * Day,
    Month = 30 * Day,
    Year = 365 * Day
}

export function dateDifference(start: Date, end: Date, unit = DateUnit.Day)
{
    return Math.floor((end.getTime() - start.getTime()) / unit);
}

export function* dateRange(start: Date, end: Date, offset = DateUnit.Day)
{
    const endTime = end.getTime();

    let unixTime: number = start.getTime();
    while (unixTime < endTime)
    {
        yield new Date(unixTime);

        unixTime += offset;
    }
}

export function dateRound(date: Date, unit = DateUnit.Day)
{
    return new Date(Math.floor(date.getTime() / unit) * unit);
}
