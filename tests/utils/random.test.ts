import { beforeEach, describe, expect, it } from "vitest";

import { ValueException } from "../../src/index.js";
import { Random } from "../../src/index.js";

describe("Random", () =>
{
    describe("Static & Non-deterministic", () =>
    {
        describe("Boolean", () =>
        {
            it("Should return a boolean value", () =>
            {
                const result = Random.Boolean();

                expect(typeof result).toBe("boolean");
            });

            it("Should return true approximately 50% of the time with default ratio", () =>
            {
                const results = Array.from({ length: 1000 }, () => Random.Boolean());
                const trueCount = results.filter(Boolean).length;

                expect(trueCount).toBeGreaterThan(400);
                expect(trueCount).toBeLessThan(600);
            });
            it("Should return true approximately 70% of the time with ratio 0.7", () =>
            {
                const results = Array.from({ length: 1000 }, () => Random.Boolean(0.7));
                const trueCount = results.filter(Boolean).length;

                expect(trueCount).toBeGreaterThan(650);
                expect(trueCount).toBeLessThan(750);
            });
        });

        describe("Integer", () =>
        {
            it("Should return an integer between 0 and max (exclusive)", () =>
            {
                const max = 5;
                const result = Random.Integer(max);

                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThan(max);
            });
            it("Should return an integer between min and max (exclusive)", () =>
            {
                const min = 2;
                const max = 7;
                const result = Random.Integer(min, max);

                expect(result).toBeGreaterThanOrEqual(min);
                expect(result).toBeLessThan(max);
            });
        });

        describe("Decimal", () =>
        {
            it("Should return a decimal between 0 and 1 (exclusive)", () =>
            {
                const result = Random.Decimal();

                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThan(1);
            });
            it("Should return a decimal between 0 and max (exclusive)", () =>
            {
                const max = 5;
                const result = Random.Decimal(max);

                expect(result).toBeGreaterThanOrEqual(0);
                expect(result).toBeLessThan(max);
            });
            it("Should return a decimal between min and max (exclusive)", () =>
            {
                const min = 2;
                const max = 7;
                const result = Random.Decimal(min, max);

                expect(result).toBeGreaterThanOrEqual(min);
                expect(result).toBeLessThan(max);
            });
        });

        describe("Index", () =>
        {
            it("Should return a valid index from the array", () =>
            {
                const elements = [1, 2, 3, 4, 5];
                const index = Random.Index(elements);

                expect(index).toBeGreaterThanOrEqual(0);
                expect(index).toBeLessThan(elements.length);
            });

            it("Should throw `ValueException` if the array is empty", () =>
            {
                expect(() => Random.Index([])).toThrow(ValueException);
            });
        });

        describe("Choice", () =>
        {
            it("Should return a random element from the array", () =>
            {
                const elements = [1, 2, 3, 4, 5];
                const choice = Random.Choice(elements);

                expect(elements).toContain(choice);
            });

            it("Should throw `ValueException` if the array is empty", () =>
            {
                expect(() => Random.Choice([])).toThrow(ValueException);
            });
        });

        describe("Sample", () =>
        {
            describe("Without weights", () =>
            {
                it("Should return an array with the specified number of elements from the original array", () =>
                {
                    const elements = [1, 2, 3, 4, 5];
                    const sample = Random.Sample(elements, 3);

                    expect(sample).toHaveLength(3);

                    for (const element of sample)
                    {
                        expect(elements).toContain(element);
                    }
                });

                it("Should return unique elements (no replacement)", () =>
                {
                    const elements = [1, 2, 3, 4, 5];
                    const sample = Random.Sample(elements, 5);

                    const uniqueElements = new Set(sample);
                    expect(uniqueElements.size).toBe(5);
                });
                it("Should return an empty array when count is 0", () =>
                {
                    const elements = [1, 2, 3, 4, 5];
                    const sample = Random.Sample(elements, 0);

                    expect(sample).toHaveLength(0);
                });
                it("Should return all elements when count equals length", () =>
                {
                    const elements = [1, 2, 3, 4, 5];
                    const sample = Random.Sample(elements, 5);

                    expect(sample).toHaveLength(5);
                    expect(sample.sort()).toEqual(elements.sort());
                });

                it("Should throw `ValueException` if the array is empty", () =>
                {
                    expect(() => Random.Sample([], 1)).toThrow(ValueException);
                });
                it("Should throw `ValueException` if count is negative", () =>
                {
                    expect(() => Random.Sample([1, 2, 3], -1)).toThrow(ValueException);
                });
                it("Should throw `ValueException` if count exceeds array length", () =>
                {
                    expect(() => Random.Sample([1, 2, 3], 5)).toThrow(ValueException);
                });
            });

            describe("With weights", () =>
            {
                it("Should return an array with the specified number of elements from the original array", () =>
                {
                    const elements = ["a", "b", "c"];
                    const weights = [1, 1, 1];
                    const sample = Random.Sample(elements, 2, weights);

                    expect(sample).toHaveLength(2);

                    for (const element of sample)
                    {
                        expect(elements).toContain(element);
                    }
                });

                it("Should return unique elements (no replacement)", () =>
                {
                    const elements = ["a", "b", "c", "d", "e"];
                    const weights = [1, 2, 3, 4, 5];
                    const sample = Random.Sample(elements, 5, weights);

                    const uniqueElements = new Set(sample);

                    expect(uniqueElements.size).toBe(5);
                });
                it("Should favor elements with higher weights", () =>
                {
                    const elements = ["rare", "common"];
                    const weights = [1, 100];

                    let commonFirstCount = 0;
                    for (let i = 0; i < 1000; i += 1)
                    {
                        const sample = Random.Sample(elements, 1, weights);

                        if (sample[0] === "common") { commonFirstCount += 1; }
                    }

                    expect(commonFirstCount).toBeGreaterThan(900);
                });

                it("Should throw `ValueException` if weights length differs from elements length", () =>
                {
                    expect(() => Random.Sample([1, 2, 3], 2, [1, 1])).toThrow(ValueException);
                });
                it("Should throw `ValueException` if any weight is zero", () =>
                {
                    expect(() => Random.Sample([1, 2, 3], 2, [1, 0, 1])).toThrow(ValueException);
                });
                it("Should throw `ValueException` if any weight is negative", () =>
                {
                    expect(() => Random.Sample([1, 2, 3], 2, [1, -1, 1])).toThrow(ValueException);
                });
            });
        });

        describe("Shuffle", () =>
        {
            it("Should keep every element exactly once", () =>
            {
                const array = [1, 2, 3, 4, 5];
                const shuffled = Random.Shuffle(array);

                expect(shuffled).toHaveLength(array.length);
                expect(new Set(shuffled)).toEqual(new Set(array));
            });
            it("Should return a new array without modifying the input", () =>
            {
                const array = [1, 2, 3, 4, 5];
                const shuffled = Random.Shuffle(array);

                expect(shuffled).not.toBe(array);
                expect(array).toEqual([1, 2, 3, 4, 5]);
            });
            it("Should accept any iterable", () =>
            {
                const shuffled = Random.Shuffle("abcde");

                expect(shuffled).toHaveLength(5);
                expect(new Set(shuffled)).toEqual(new Set(["a", "b", "c", "d", "e"]));
            });
            it("Should return an empty array for an empty iterable", () =>
            {
                expect(Random.Shuffle([])).toEqual([]);
            });
        });

        describe("Split", () =>
        {
            describe("With a numeric total", () =>
            {
                it("Should return an array of parts that sum to the total", () =>
                {
                    const total = 100;
                    const parts = 5;
                    const result = Random.Split(total, parts);

                    expect(result).toHaveLength(parts);
                    expect(result.reduce((sum, val) => sum + val, 0)).toBe(total);
                });

                it("Should return a single part equal to the total when parts is 1", () =>
                {
                    const result = Random.Split(42, 1);
                    expect(result).toEqual([42]);
                });
                it("Should return all zeros when total is 0", () =>
                {
                    const result = Random.Split(0, 3);
                    expect(result).toEqual([0, 0, 0]);
                });
                it("Should return non-negative values", () =>
                {
                    const result = Random.Split(10, 10);

                    for (const value of result) { expect(value).toBeGreaterThanOrEqual(0); }
                });

                it("Should throw `ValueException` if the total is negative", () =>
                {
                    expect(() => Random.Split(-1, 2)).toThrow(ValueException);
                });
                it("Should throw `ValueException` if parts is less than 1", () =>
                {
                    expect(() => Random.Split(10, 0)).toThrow(ValueException);
                });
            });

            describe("With an iterable of elements", () =>
            {
                it("Should return the correct number of groups", () =>
                {
                    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                    const groups = Random.Split(elements, 3);

                    expect(groups).toHaveLength(3);
                });

                it("Should contain all original elements across all groups", () =>
                {
                    const elements = [1, 2, 3, 4, 5, 6, 7, 8];
                    const groups = Random.Split(elements, 3);

                    const flattened = groups.flat();
                    expect(flattened).toEqual(elements);
                });

                it("Should return a single group with all elements when groups is 1", () =>
                {
                    const elements = [1, 2, 3];
                    const groups = Random.Split(elements, 1);

                    expect(groups).toHaveLength(1);
                    expect(groups[0]).toEqual(elements);
                });
                it("Should work with a string iterable", () =>
                {
                    const groups = Random.Split("abcdef", 2);
                    const flattened = groups.flat();

                    expect(groups).toHaveLength(2);
                    expect(flattened).toEqual(["a", "b", "c", "d", "e", "f"]);
                });

                it("Should throw `ValueException` if the iterable is empty", () =>
                {
                    expect(() => Random.Split([], 1)).toThrow(ValueException);
                });
                it("Should throw `ValueException` if groups exceeds the number of elements", () =>
                {
                    expect(() => Random.Split([1, 2, 3], 5)).toThrow(ValueException);
                });
                it("Should throw `ValueException` if groups is less than 1", () =>
                {
                    expect(() => Random.Split([1, 2], 0)).toThrow(ValueException);
                });
            });
        });
    });

    describe("Seeded & Deterministic", () =>
    {
        let rng: Random;
        beforeEach(() => { rng = Random.FromSeed(42); });

        describe("boolean", () =>
        {
            it("Should produce a deterministic sequence with default ratio", () =>
            {
                const results = Array.from({ length: 10 }, () => rng.boolean());
                expect(results).toEqual([false, true, false, false, true, false, true, false, false, true]);
            });
            it("Should produce a deterministic sequence with a custom ratio", () =>
            {
                const results = Array.from({ length: 10 }, () => rng.boolean(0.7));
                expect(results).toEqual([true, true, false, true, true, true, true, true, false, true]);
            });
        });

        describe("integer", () =>
        {
            it("Should produce a deterministic sequence with max only", () =>
            {
                const results = Array.from({ length: 10 }, () => rng.integer(100));
                expect(results).toEqual([60, 44, 85, 66, 17, 52, 27, 62, 86, 47]);
            });
            it("Should produce a deterministic sequence with min and max", () =>
            {
                const results = Array.from({ length: 10 }, () => rng.integer(10, 20));
                expect(results).toEqual([16, 14, 18, 16, 11, 15, 12, 16, 18, 14]);
            });
        });

        describe("decimal", () =>
        {
            it("Should produce a deterministic sequence without arguments", () =>
            {
                const results = Array.from({ length: 10 }, () => rng.decimal());
                expect(results).toEqual([
                    0.6011037519201636,
                    0.44829055899754167,
                    0.8524657934904099,
                    0.6697340414393693,
                    0.17481389874592423,
                    0.5265925421845168,
                    0.2732279943302274,
                    0.6247446539346129,
                    0.8654746483080089,
                    0.4723170551005751
                ]);
            });
            it("Should produce a deterministic sequence with max only", () =>
            {
                const results = Array.from({ length: 5 }, () => rng.decimal(5));
                expect(results).toEqual([
                    3.005518759600818,
                    2.2414527949877083,
                    4.262328967452049,
                    3.3486702071968466,
                    0.8740694937296212
                ]);
            });
            it("Should produce a deterministic sequence with min and max", () =>
            {
                const results = Array.from({ length: 5 }, () => rng.decimal(2, 7));
                expect(results).toEqual([
                    5.005518759600818,
                    4.241452794987708,
                    6.262328967452049,
                    5.348670207196847,
                    2.874069493729621
                ]);
            });
        });

        describe("index", () =>
        {
            it("Should produce a deterministic sequence", () =>
            {
                const elements = ["a", "b", "c", "d", "e"];
                const results = Array.from({ length: 5 }, () => rng.index(elements));

                expect(results).toEqual([3, 2, 4, 3, 0]);
            });
            it("Should throw `ValueException` if the array is empty", () =>
            {
                expect(() => rng.index([]))
                    .toThrow(ValueException);
            });
        });

        describe("choice", () =>
        {
            it("Should produce a deterministic sequence", () =>
            {
                const elements = ["a", "b", "c", "d", "e"];
                const results = Array.from({ length: 5 }, () => rng.choice(elements));

                expect(results).toEqual(["d", "c", "e", "d", "a"]);
            });
            it("Should throw `ValueException` if the array is empty", () =>
            {
                expect(() => rng.choice([]))
                    .toThrow(ValueException);
            });
        });

        describe("sample", () =>
        {
            it("Should produce a deterministic unweighted sample", () =>
            {
                const result = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
                expect(result).toEqual([7, 6, 9]);
            });
            it("Should produce a deterministic weighted sample", () =>
            {
                const result = rng.sample(["a", "b", "c", "d", "e"], 3, [5, 1, 1, 1, 1]);
                expect(result).toEqual(["a", "c", "d"]);
            });
            it("Should return an empty array when count is 0", () =>
            {
                const result = rng.sample([1, 2, 3], 0);
                expect(result).toEqual([]);
            });
            it("Should throw `ValueException` if the array is empty", () =>
            {
                expect(() => rng.sample([], 1))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` if count is negative", () =>
            {
                expect(() => rng.sample([1, 2, 3], -1))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` if count exceeds the number of elements", () =>
            {
                expect(() => rng.sample([1, 2], 3))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` if weights length doesn't match", () =>
            {
                expect(() => rng.sample([1, 2, 3], 2, [1, 1]))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` if any weight is non-positive", () =>
            {
                expect(() => rng.sample([1, 2, 3], 2, [1, 0, 1]))
                    .toThrow(ValueException);
            });
        });

        describe("shuffle", () =>
        {
            it("Should produce a deterministic permutation", () =>
            {
                expect(rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toEqual([1, 8, 4, 6, 3, 2, 9, 10, 5, 7]);
            });
            it("Should produce the same permutation across two instances with the same seed", () =>
            {
                const other = Random.FromSeed(42);

                expect(rng.shuffle("abcdefghij")).toEqual(other.shuffle("abcdefghij"));
            });
            it("Should consume exactly `length - 1` draws", () =>
            {
                rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

                expect(rng.state).toBe((42 + (9 * 0x6D2B79F5)) | 0);
            });
            it("Should not advance the state for an empty iterable", () =>
            {
                expect(rng.shuffle([])).toEqual([]);
                expect(rng.state).toBe(42);
            });
        });

        describe("split", () =>
        {
            it("Should produce a deterministic split of a number", () =>
            {
                expect(rng.split(100, 4)).toEqual([45, 15, 26, 14]);
            });
            it("Should produce a deterministic split of an array", () =>
            {
                expect(rng.split([1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([[1, 2, 3], [4], [5, 6, 7, 8]]);
            });
            it("Should produce a deterministic split of a string iterable", () =>
            {
                expect(rng.split("abcdef", 2)).toEqual([["a", "b", "c", "d"], ["e", "f"]]);
            });
            it("Should throw `ValueException` if parts is less than 1", () =>
            {
                expect(() => rng.split(10, 0))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` if the total is negative", () =>
            {
                expect(() => rng.split(-1, 2))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` if the iterable is empty", () =>
            {
                expect(() => rng.split([], 1))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` if parts exceeds the number of elements", () =>
            {
                expect(() => rng.split([1, 2, 3], 5))
                    .toThrow(ValueException);
            });
        });

        describe("Reproducibility", () =>
        {
            it("Should produce identical sequences across two instances with the same seed", () =>
            {
                const a = Random.FromSeed(42);
                const b = Random.FromSeed(42);

                const sequenceA = Array.from({ length: 100 }, () => a.decimal());
                const sequenceB = Array.from({ length: 100 }, () => b.decimal());

                expect(sequenceA).toEqual(sequenceB);
            });
            it("Should produce different first values for different seeds", () =>
            {
                expect(Random.FromSeed(1).integer(1000)).toBe(627);
                expect(Random.FromSeed(2).integer(1000)).toBe(734);
            });
            it("Should not share state with the static API", () =>
            {
                rng.decimal();
                const _rng = Random.FromSeed(42);

                const first = rng.decimal();

                Random.Decimal();
                Random.Decimal();
                Random.Decimal();

                _rng.decimal();
                const second = _rng.decimal();

                expect(second).toBe(first);
            });
        });

        describe("seed & state", () =>
        {
            it("Should expose the seed the instance was created with", () =>
            {
                expect(rng.seed).toBe(42);
            });
            it("Should have a state equal to the seed before any draw", () =>
            {
                expect(rng.state).toBe(42);
            });
            it("Should advance the state by the Mulberry32 increment on each draw", () =>
            {
                for (let index = 0; index < 5; index += 1) { rng.decimal(); }

                expect(rng.state).toBe((42 + (5 * 0x6D2B79F5)) | 0);
            });
            it("Should never change the seed while drawing", () =>
            {
                rng.decimal();

                expect(rng.state).not.toBe(42);
                expect(rng.seed).toBe(42);
            });
            it("Should accept the 32-bit signed integer boundaries as seed", () =>
            {
                expect(Random.FromSeed(2_147_483_647).seed).toBe(2_147_483_647);
                expect(Random.FromSeed(-2_147_483_648).seed).toBe(-2_147_483_648);
            });

            it("Should throw `ValueException` when the seed isn't an integer", () =>
            {
                expect(() => Random.FromSeed(1.5))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` when the seed is `NaN`", () =>
            {
                expect(() => Random.FromSeed(NaN))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` when the seed exceeds the 32-bit signed integer range", () =>
            {
                expect(() => Random.FromSeed(2_147_483_648))
                    .toThrow(ValueException);

                expect(() => Random.FromSeed(-2_147_483_649))
                    .toThrow(ValueException);
            });
        });

        describe("FromState", () =>
        {
            it("Should resume the sequence from a captured state", () =>
            {
                for (let index = 0; index < 5; index += 1) { rng.decimal(); }

                const state = rng.state;
                const expected = [rng.decimal(), rng.decimal(), rng.decimal()];

                const restored = Random.FromState(42, state);
                const actual = [restored.decimal(), restored.decimal(), restored.decimal()];

                expect(actual).toEqual(expected);
            });
            it("Should behave like `FromSeed` when the state equals the seed", () =>
            {
                const restored = Random.FromState(42, 42);

                const sequenceA = Array.from({ length: 20 }, () => rng.decimal());
                const sequenceB = Array.from({ length: 20 }, () => restored.decimal());

                expect(sequenceA).toEqual(sequenceB);
            });
            it("Should expose the given seed and state", () =>
            {
                const restored = Random.FromState(42, 1_831_565_855);

                expect(restored.seed).toBe(42);
                expect(restored.state).toBe(1_831_565_855);
            });

            it("Should throw `ValueException` when the seed isn't a 32-bit signed integer", () =>
            {
                expect(() => Random.FromState(1.5, 42))
                    .toThrow(ValueException);
            });
            it("Should throw `ValueException` when the state isn't a 32-bit signed integer", () =>
            {
                expect(() => Random.FromState(42, 1.5))
                    .toThrow(ValueException);

                expect(() => Random.FromState(42, 2_147_483_648))
                    .toThrow(ValueException);
            });
        });

        describe("clone", () =>
        {
            it("Should produce the same upcoming values as the original", () =>
            {
                for (let index = 0; index < 3; index += 1) { rng.decimal(); }

                const copy = rng.clone();

                const sequenceA = Array.from({ length: 20 }, () => rng.decimal());
                const sequenceB = Array.from({ length: 20 }, () => copy.decimal());

                expect(sequenceA).toEqual(sequenceB);
            });
            it("Should not advance the original's state when drawing from the copy", () =>
            {
                const copy = rng.clone();
                const state = rng.state;

                copy.decimal();
                copy.decimal();

                expect(rng.state).toBe(state);
                expect(copy.state).not.toBe(state);
            });
            it("Should share the same seed and state at creation time", () =>
            {
                rng.decimal();

                const copy = rng.clone();

                expect(copy.seed).toBe(rng.seed);
                expect(copy.state).toBe(rng.state);
            });
        });
    });
});
