export function delay(milliseconds: number): Promise<void>
{
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function nextAnimationFrame(): Promise<void>
{
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export function yieldToEventLoop(): Promise<void>
{
    return new Promise((resolve) => setTimeout(resolve));
}
