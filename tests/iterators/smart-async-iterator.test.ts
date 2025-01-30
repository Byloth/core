import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { delay, ValueException, type MaybePromise } from "../../src/index.js";
import { SmartAsyncIterator } from "../../src/index.js";

describe("SmartAsyncIterator", () =>
{
    const _toAsync = <T>(elements: Iterable<T>) =>
    {
        return async function* ()
        {
            for (const element of elements)
            {
                await delay(100);

                yield element;
            }
        };
    };

    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.clearAllTimers());

    it("Should initialize with an iterable", async () =>
    {
        const _iterable = [1, 2, 3];

        const iterator = new SmartAsyncIterator(_iterable);
        expect(await iterator.toArray()).toEqual([1, 2, 3]);
    });
    it("Should initialize with an iterator", async () =>
    {
        const _iterator = {
            _index: 0,

            next: async function()
            {
                await delay(100);

                if (this._index < 3)
                {
                    this._index += 1;

                    return { done: false, value: this._index };
                }

                return { done: true, value: undefined };
            }
        };

        const iterator = new SmartAsyncIterator(_iterator);

        let resolved = false;
        iterator.toArray()
            .then((results) =>
            {
                resolved = true;

                expect(results).toEqual([1, 2, 3]);
            });

        await vi.advanceTimersByTimeAsync(300);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should initialize with a generator function", async () =>
    {
        const _generatorFn = async function* ()
        {
            for (let i = 1; i < 4; i += 1)
            {
                await delay(100);

                yield i;
            }

            await delay(100);
        };

        const iterator = new SmartAsyncIterator(_generatorFn);

        let resolved = false;
        iterator.toArray()
            .then((results) =>
            {
                resolved = true;

                expect(results).toEqual([1, 2, 3]);
            });

        await vi.advanceTimersByTimeAsync(300);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should return `true` if every value matches the predicate", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([2, 4, 6, 8, 10]));

        let resolved = false;
        iterator.every(async (value) => value % 2 === 0)
            .then((results) =>
            {
                resolved = true;

                expect(results).toBe(true);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should return `false` if not every value matches the predicate", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([2, 4, 5, 6, 7, 8, 10]));

        let resolved = false;
        iterator.every(async (value) => value % 2 === 0)
            .then((results) =>
            {
                resolved = true;

                expect(results).toBe(false);
            });

        await vi.advanceTimersByTimeAsync(200);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should return `true` if some values match the predicate", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));

        let resolved = false;
        iterator.some(async (value) => value % 2 === 0)
            .then((results) =>
            {
                resolved = true;

                expect(results).toBe(true);
            });

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should return `false` if no values match the predicate", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 3, 5, 7, 9]));

        let resolved = false;
        iterator.some(async (value) => value % 2 === 0)
            .then((results) =>
            {
                resolved = true;

                expect(results).toBe(false);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should filter values correctly", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));
        const results = iterator.filter(async (value) => value % 2 === 0);

        let resolved = false;
        results.toArray()
            .then((_results) =>
            {
                resolved = true;

                expect(_results).toEqual([2, 4]);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should map values correctly", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));
        const results = iterator.map(async (value) => value * 2);

        let resolved = false;
        results.toArray()
            .then((_results) =>
            {
                resolved = true;

                expect(_results).toEqual([2, 4, 6, 8, 10]);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should reduce values correctly", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));

        let resolved = false;
        iterator.reduce(async (acc, value) => acc + value)
            .then((results) =>
            {
                resolved = true;

                expect(results).toBe(15);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should reduce values with initial value correctly", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));

        let resolved = false;
        iterator.reduce(async (acc, value) => acc + value, 10)
            .then((results) =>
            {
                resolved = true;

                expect(results).toBe(25);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should throw `ValueException` when reducing an empty iterator without initial value", async () =>
    {
        const iterator = new SmartAsyncIterator<number>(_toAsync([]));

        try
        {
            await iterator.reduce((acc, value) => acc + value);
        }
        catch (error)
        {
            expect(error).toBeInstanceOf(ValueException);
        }
    });

    it("Should flatten elements with `flatMap`", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, [2, 3], 4, 5, [6, 7, 8]]));
        const results = iterator.flatMap(async (value) => value);

        let resolved = false;
        results.toArray()
            .then((_results) =>
            {
                resolved = true;

                expect(_results).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should drop the specified number of elements", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));
        const results = iterator.drop(3);

        let resolved = false;
        results.toArray()
            .then((_results) =>
            {
                resolved = true;

                expect(_results).toEqual([4, 5]);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should take the specified number of elements", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));
        const results = iterator.take(3);

        let resolved = false;
        results.toArray()
            .then((_results) =>
            {
                resolved = true;

                expect(_results).toEqual([1, 2, 3]);
            });

        await vi.advanceTimersByTimeAsync(200);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should find the first matching value", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));

        let resolved = false;
        iterator.find(async (value) => value > 3)
            .then((results) =>
            {
                resolved = true;

                expect(results).toBe(4);
            });

        await vi.advanceTimersByTimeAsync(300);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should return `undefined` when no matching value is found", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3]));

        let resolved = false;
        iterator.find(async (value) => value > 3)
            .then((results) =>
            {
                resolved = true;

                expect(results).toBeUndefined();
            });

        await vi.advanceTimersByTimeAsync(200);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should enumerate elements with their indices", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync(["A", "B", "C"]));
        const results = iterator.enumerate();

        let resolved = false;
        results.toArray()
            .then((_results) =>
            {
                resolved = true;

                expect(_results).toEqual([[0, "A"], [1, "B"], [2, "C"]]);
            });

        await vi.advanceTimersByTimeAsync(200);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should remove duplicate elements", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 2, 1, 3, 1, 4, 3, 4, 5, 5]));
        const results = iterator.unique();

        let resolved = false;
        results.toArray()
            .then((_results) =>
            {
                resolved = true;

                expect(_results).toEqual([1, 2, 3, 4, 5]);
            });

        await vi.advanceTimersByTimeAsync(1_000);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should count the number of elements", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));
        const results = iterator.count();

        let resolved = false;
        results.then((_results) =>
        {
            resolved = true;

            expect(_results).toBe(5);
        });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should iterate over elements with `forEach`", async () =>
    {
        const results: number[] = [];
        const _iteratee = vi.fn(async (x: MaybePromise<number>) => { results.push(await x); });

        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5]));

        let resolved = false;
        iterator.forEach(_iteratee)
            .then(() =>
            {
                resolved = true;

                expect(results).toEqual([1, 2, 3, 4, 5]);
            });

        await vi.advanceTimersByTimeAsync(400);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });

    it("Should handle return method correctly", async () =>
    {
        const _iterator: AsyncIterableIterator<number, string> = {
            next: async () => ({ done: false, value: 1 }),
            return: async (value?: string) =>
            {
                return { done: true, value: value ?? "Naturally done!" };
            },

            [Symbol.asyncIterator]: () => _iterator
        };

        const iterator = new SmartAsyncIterator(_iterator as AsyncIterator<number, string>);
        const results = iterator.return("Prematurely done!");

        let resolved = false;
        results.then((_results) =>
        {
            resolved = true;

            expect(_results).toEqual({ done: true, value: "Prematurely done!" });
        });

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
    it("Should handle throw method correctly", async () =>
    {
        const _iterator: AsyncIterator<number, string> = {
            next: async () => ({ done: false, value: 1 }),
            throw: async (error: unknown) => { throw error; }
        };

        const iterator = new SmartAsyncIterator(_iterator);
        const reason = new Error("Something went wrong!");

        try
        {
            await iterator.throw(reason);
        }
        catch (error)
        {
            expect(error).toBe(reason);
        }
    });

    it("Should group elements by key", async () =>
    {
        const iterator = new SmartAsyncIterator(_toAsync([1, 2, 3, 4, 5, 6]));
        const results = iterator.groupBy(async (value) => (value % 2 === 0 ? "even" : "odd"));

        let resolved = false;
        results.toObject()
            .then((_results) =>
            {
                resolved = true;

                expect(_results).toEqual({ odd: [1, 3, 5], even: [2, 4, 6] });
            });

        await vi.advanceTimersByTimeAsync(500);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(100);
        expect(resolved).toBe(true);
    });
});
