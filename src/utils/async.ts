export function delay(milliseconds: number): Promise<void>
{
    return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

export function nextAnimationFrame(): Promise<void>
{
    return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}
