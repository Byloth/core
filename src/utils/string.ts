/**
 * Capitalize the first letter of a string.
 *
 * ---
 *
 * @example
 * ```ts
 * capitalize('hello'); // 'Hello'
 * ```
 *
 * ---
 *
 * @param value The string to capitalize.
 *
 * @returns The capitalized string.
 */
export function capitalize(value: string): string
{
    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
