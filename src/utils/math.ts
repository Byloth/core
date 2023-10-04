export function hash(value: string): number
{
    let hash = 0;
    for (let i = 0; i < value.length; i++)
    {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    return hash;
}

export function random(): number;
export function random(max: number): number;
export function random(min: number, max: number): number;
export function random(min: number, max: number, isDecimal: boolean): number;
export function random(min: number, max: number, digits: number): number;
export function random(min: number = 1, max?: number, decimals?: boolean | number): number
{
    if (max === undefined)
    {
        max = min;
        min = 0;
    }

    if (min === max)
    {
        return min;
    }

    let rounder: (value: number) => number;

    if (decimals === true)
    {
        rounder = (value) => value;
    }
    else if (decimals === undefined)
    {
        if (Math.abs(max - min) <= 1)
        {
            rounder = (value) => value;
        }
        else
        {
            rounder = Math.floor;
        }
    }
    else if (decimals === false)
    {
        rounder = Math.floor;
    }
    else
    {
        const digits = 10 ** decimals;

        rounder = (value) => Math.floor(value * digits) / digits;
    }

    return rounder(Math.random() * (max - min) + min);
}
