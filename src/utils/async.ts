export async function delay(milliseconds: number): Promise<void>
{
    return new Promise<void>((resolve, reject) => setTimeout(resolve, milliseconds));
}

export async function nextAnimationFrame(): Promise<void>
{
    return new Promise<void>((resolve, reject) => requestAnimationFrame(() => resolve()));
}
