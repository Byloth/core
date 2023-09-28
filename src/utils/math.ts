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
