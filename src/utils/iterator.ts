import { SmartIterator } from "../models/index.js";

/**
 * An utility function that chains multiple iterables into a single one.
 *
 * ```ts
 * for (const value of chain([1, 2, 3], [4, 5, 6], [7, 8, 9]))
 * {
 *     console.log(value); // 1, 2, 3, 4, 5, 6, 7, 8, 9
 * }
 * ```
 *
 * ---
 *
 * @param iterables The list of iterables to chain.
 *
 * @returns A {@link SmartIterator} object that chains the iterables into a single one.
 */
export function chain<T>(...iterables: Iterable<T>[]): SmartIterator<T>
{
    return new SmartIterator<T>(function* ()
    {
        for (const iterable of iterables)
        {
            for (const element of iterable) { yield element; }
        }
    });
}

/**
 * An utility function that counts the number of elements in an iterable.
 *
 * Also note that:
 * - If the iterable isn't an `Array`, it will be consumed entirely in the process.
 * - If the iterable is an infinite generator, the function will never return.
 *
 * ```ts
 * count([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); // 10
 * ```
 *
 * ---
 *
 * @param elements The iterable to count.
 *
 * @returns The number of elements in the iterable.
 */
export function count<T>(elements: Iterable<T>): number
{
    if (Array.isArray(elements)) { return elements.length; }

    let _count = 0;
    for (const _ of elements) { _count += 1; }

    return _count;
}

/**
 * An utility function that enumerates the elements of an iterable.
 *
 * ```ts
 * for (const [index, value] of enumerate(["A", "M", "N", "Z"]))
 * {
 *     console.log(`${index}: ${value}`); // "0: A", "1: M", "2: N", "3: Z"
 * }
 * ```
 *
 * ---
 *
 * @param elements The iterable to enumerate.
 *
 * @returns A {@link SmartIterator} object that enumerates the elements of the given iterable.
 */
export function enumerate<T>(elements: Iterable<T>): SmartIterator<[number, T]>
{
    return new SmartIterator<[number, T]>(function* ()
    {
        let index = 0;

        for (const element of elements)
        {
            yield [index, element];

            index += 1;
        }
    });
}

/**
 * An utility function that generates an iterator over a range of numbers.  
 * The values are included between `0` (included) and `end` (excluded).
 *
 * The default step between the numbers is `1`.
 *
 * ```ts
 * for (const number of range(5))
 * {
 *    console.log(number); // 0, 1, 2, 3, 4
 * }
 * ```
 *
 * ---
 *
 * @param end
 * The end value (excluded).
 *
 * If the `end` value is negative, the step will be `-1` leading to generate the numbers in reverse order.
 *
 * @returns A {@link SmartIterator} object that generates the numbers in the range.
 */
export function range(end: number): SmartIterator<number>;

/**
 * An utility function that generates an iterator over a range of numbers.  
 * The values are included between `start` (included) and `end` (excluded).
 *
 * The step between the numbers can be specified with a custom value. Default is `1`.
 *
 * ```ts
 * for (const number of range(2, 7))
 * {
 *    console.log(number); // 2, 3, 4, 5, 6
 * }
 * ```
 *
 * ---
 *
 * @param start
 * The start value (included).
 *
 * If the `start` value is greater than the `end` value, the iterator will generate the numbers in reverse order.
 *
 * @param end
 * The end value (excluded).
 *
 * If the `end` value is less than the `start` value, the iterator will generate the numbers in reverse order.
 *
 * @param step The step between the numbers. Default is `1`.
 * 
 * @returns A {@link SmartIterator} object that generates the numbers in the range.
 */
export function range(start: number, end: number, step?: number): SmartIterator<number>;
export function range(start: number, end?: number, step = 1): SmartIterator<number>
{
    return new SmartIterator<number>(function* ()
    {
        if (end === undefined)
        {
            end = start;
            start = 0;
        }

        if (start > end) { step = step ?? -1; }

        for (let index = start; index < end; index += step) { yield index; }
    });
}

/**
 * An utility function shuffles the elements of a given iterable.
 *
 * The function uses the {@link https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle|Fisher-Yates}
 * algorithm to shuffle the elements.
 *
 * Also note that:
 * - If the iterable is an `Array`, it won't be modified since the shuffling isn't done in-place.
 * - If the iterable isn't an `Array`, it will be consumed entirely in the process.
 * - If the iterable is an infinite generator, the function will never return.
 *
 * ```ts
 * shuffle([1, 2, 3, 4, 5]); // [3, 1, 5, 2, 4]
 * ```
 *
 * ---
 *
 * @param iterable The iterable to shuffle.
 *
 * @returns A new `Array` containing the shuffled elements of the given iterable.
 */
export function shuffle<T>(iterable: Iterable<T>): T[]
{
    const array = Array.from(iterable);

    for (let index = array.length - 1; index > 0; index -= 1)
    {
        const jndex = Math.floor(Math.random() * (index + 1));

        [array[index], array[jndex]] = [array[jndex], array[index]];
    }

    return array;
}

/**
 * An utility function that filters the elements of an iterable ensuring that they are all unique.
 *
 * ```ts
 * for (const value of unique([1, 1, 2, 3, 2, 3, 4, 5, 5, 4]))
 * {
 *     console.log(value); // 1, 2, 3, 4, 5
 * }
 * ```
 *
 * ---
 *
 * @param elements The iterable to filter.
 *
 * @returns A {@link SmartIterator} object that iterates over the unique elements of the given iterable.
 */
export function unique<T>(elements: Iterable<T>): SmartIterator<T>
{
    return new SmartIterator<T>(function* ()
    {
        const values = new Set<T>();

        for (const element of elements)
        {
            if (values.has(element)) { continue; }

            values.add(element);

            yield element;
        }
    });
}

/**
 * An utility function that zips two iterables into a single one.  
 * The resulting iterable will contain the elements of the two iterables paired together.
 *
 * The function will stop when one of the two iterables is exhausted.
 *
 * ```ts
 * for (const [number, char] of zip([1, 2, 3, 4], ["A", "M", "N" "Z"]))
 * {
 *     console.log(`${number} - ${char}`); // "1 - A", "2 - M", "3 - N", "4 - Z"
 * }
 * ```
 *
 * ---
 *
 * @param first The first iterable to zip.
 * @param second The second iterable to zip.
 *
 * @returns A {@link SmartIterator} object that iterates over the zipped elements of the two given iterables.
 */
export function zip<T, U>(first: Iterable<T>, second: Iterable<U>): SmartIterator<[T, U]>
{
    return new SmartIterator<[T, U]>(function* ()
    {
        const firstIterator = first[Symbol.iterator]();
        const secondIterator = second[Symbol.iterator]();

        while (true)
        {
            const firstResult = firstIterator.next();
            const secondResult = secondIterator.next();

            if ((firstResult.done) || (secondResult.done)) { break; }

            yield [firstResult.value, secondResult.value];
        }
    });
}
