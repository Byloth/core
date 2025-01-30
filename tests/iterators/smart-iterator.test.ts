import { describe, it, expect, vi } from "vitest";

import { ValueException } from "../../src/index.js";
import { SmartIterator } from "../../src/index.js";

describe("SmartIterator", () =>
{
    it("Should initialize with an iterable", () =>
    {
        const _iterable = [1, 2, 3];

        const iterator = new SmartIterator(_iterable);
        expect(iterator.toArray()).toEqual([1, 2, 3]);
    });
    it("Should initialize with an iterator", () =>
    {
        const _iterator = {
            _index: 0,

            next: function()
            {
                if (this._index < 3)
                {
                    this._index += 1;

                    return { done: false, value: this._index };
                }

                return { done: true, value: undefined };
            }
        };

        const iterator = new SmartIterator(_iterator);
        expect(iterator.toArray()).toEqual([1, 2, 3]);
    });
    it("Should initialize with a generator function", () =>
    {
        const _generatorFn = function* ()
        {
            yield 1;
            yield 2;
            yield 3;
        };

        const iterator = new SmartIterator(_generatorFn);
        expect(iterator.toArray()).toEqual([1, 2, 3]);
    });

    it("Should return `true` if every value matches the predicate", () =>
    {
        const iterator = new SmartIterator([2, 4, 6, 8, 10]);

        const results = iterator.every((value) => value % 2 === 0);
        expect(results).toBe(true);
    });
    it("Should return `false` if not every value matches the predicate", () =>
    {
        const iterator = new SmartIterator([2, 4, 5, 6, 7, 8, 10]);

        const results = iterator.every((value) => value % 2 === 0);
        expect(results).toBe(false);
    });

    it("Should return `true` if some values match the predicate", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4, 5]);

        const results = iterator.some((value) => value % 2 === 0);
        expect(results).toBe(true);
    });
    it("Should return `false` if no values match the predicate", () =>
    {
        const iterator = new SmartIterator([1, 3, 5, 7, 9]);

        const results = iterator.some((value) => value % 2 === 0);
        expect(results).toBe(false);
    });

    it("Should filter values correctly", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4]);

        const results = iterator.filter((x) => x % 2 === 0);
        expect(results.toArray()).toEqual([2, 4]);
    });
    it("Should map values correctly", () =>
    {
        const iterator = new SmartIterator([1, 2, 3]);

        const results = iterator.map((x) => x * 2);
        expect(results.toArray()).toEqual([2, 4, 6]);
    });

    it("Should reduce values correctly", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4, 5]);

        const results = iterator.reduce((acc, value) => acc + value);
        expect(results).toBe(15);
    });
    it("Should reduce values with initial value correctly", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4, 5]);

        const results = iterator.reduce((acc, value) => acc + value, 10);
        expect(results).toBe(25);
    });

    it("Should throw `ValueException` when reducing an empty iterator without initial value", () =>
    {
        const iterator = new SmartIterator<number>([]);

        expect(() => iterator.reduce((acc, value) => acc + value)).toThrow(ValueException);
    });

    it("Should flatten elements with `flatMap`", () =>
    {
        const iterator = new SmartIterator([1, [2, 3], 4, 5, [6, 7, 8]]);

        const results = iterator.flatMap((x) => x);
        expect(results.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("Should drop the specified number of elements", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4, 5]);

        const results = iterator.drop(3);
        expect(results.toArray()).toEqual([4, 5]);
    });
    it("Should take the specified number of elements", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4, 5]);

        const results = iterator.take(3);
        expect(results.toArray()).toEqual([1, 2, 3]);
    });

    it("Should find the first matching value", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4, 5]);

        const results = iterator.find((x) => x > 3);
        expect(results).toBe(4);
    });
    it("Should return `undefined` when no matching value is found", () =>
    {
        const iterator = new SmartIterator([1, 2, 3]);

        const results = iterator.find((x) => x > 3);
        expect(results).toBeUndefined();
    });

    it("Should enumerate elements with their indices", () =>
    {
        const iterator = new SmartIterator(["A", "B", "C"]);

        const results = iterator.enumerate();
        expect(results.toArray()).toEqual([[0, "A"], [1, "B"], [2, "C"]]);
    });
    it("Should remove duplicate elements", () =>
    {
        const iterator = new SmartIterator([1, 2, 2, 1, 3, 1, 4, 3, 4, 5, 5]);

        const results = iterator.unique();
        expect(results.toArray()).toEqual([1, 2, 3, 4, 5]);
    });
    it("Should count the number of elements", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4, 5]);

        const results = iterator.count();
        expect(results).toBe(5);
    });

    it("Should iterate over elements with `forEach`", () =>
    {
        const results: number[] = [];
        const _iteratee = vi.fn((x: number) => { results.push(x); });

        const iterator = new SmartIterator([1, 2, 3]);
        iterator.forEach(_iteratee);

        expect(results).toEqual([1, 2, 3]);
        expect(_iteratee).toBeCalledTimes(3);
    });

    it("Should handle return method correctly", () =>
    {
        const _iterator: IterableIterator<number, string> = {
            next: () => ({ done: false, value: 1 }),
            return: (value?: string) =>
            {
                return { done: true, value: value ?? "Naturally done!" };
            },

            [Symbol.iterator]: () => _iterator
        };

        const iterator = new SmartIterator(_iterator as Iterator<number, string>);
        const results = iterator.return("Prematurely done!");

        expect(results).toEqual({ done: true, value: "Prematurely done!" });
    });
    it("Should handle throw method correctly", () =>
    {
        const _iterator = {
            next: () => ({ done: false, value: 1 }),
            throw: (error: unknown) => { throw error; }
        };

        const iterator = new SmartIterator(_iterator);
        const reason = new Error("Something went wrong!");

        expect(() => iterator.throw(reason)).toThrow(reason);
    });

    it("Should group elements by key", () =>
    {
        const iterator = new SmartIterator([1, 2, 3, 4, 5, 6]);

        const results = iterator.groupBy((x) => x % 2 === 0 ? "even" : "odd");
        expect(results.toObject()).toEqual({ odd: [1, 3, 5], even: [2, 4, 6] });
    });
});
