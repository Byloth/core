import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmartPromise } from "../../../src/index.js";

describe("SmartPromise", () =>
{
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.clearAllTimers());

    it("Should be pending initially", () =>
    {
        const _callback = vi.fn();
        const promise = new SmartPromise<string>(_callback);

        expect(promise.isPending).toBe(true);
        expect(promise.isFulfilled).toBe(false);
        expect(promise.isRejected).toBe(false);

        expect(_callback).toHaveBeenCalled();
    });

    it("Should be fulfilled after resolving", async () =>
    {
        const promise = new SmartPromise<string>((resolve, reject) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);
        });

        vi.advanceTimersByTime(100);

        const result = await promise;
        expect(result).toBe("Hello, world!");

        expect(promise.isPending).toBe(false);
        expect(promise.isFulfilled).toBe(true);
        expect(promise.isRejected).toBe(false);
    });
    it("Should be rejected after rejecting", async () =>
    {
        const promise = new SmartPromise<string>((resolve, reject) =>
        {
            setTimeout(() => reject(new Error("An error occurred")), 100);
        });

        vi.advanceTimersByTime(100);

        try
        {
            await promise;
        }
        catch (error)
        {
            expect(error).toEqual(new Error("An error occurred"));

            expect(promise.isPending).toBe(false);
            expect(promise.isFulfilled).toBe(false);
            expect(promise.isRejected).toBe(true);
        }
    });

    it("Should wrap an existing promise", async () =>
    {
        const nativePromise = new Promise<string>((resolve, reject) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);
        });

        const smartPromise = SmartPromise.FromPromise(nativePromise);
        expect(smartPromise.isPending).toBe(true);
        expect(smartPromise.isFulfilled).toBe(false);
        expect(smartPromise.isRejected).toBe(false);

        vi.advanceTimersByTime(100);

        const result = await smartPromise;
        expect(result).toBe("Hello, world!");

        expect(smartPromise.isPending).toBe(false);
        expect(smartPromise.isFulfilled).toBe(true);
        expect(smartPromise.isRejected).toBe(false);
    });

    it("Should handle then callbacks", async () =>
    {
        const promise = new SmartPromise<string>((resolve, reject) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);
        });

        vi.advanceTimersByTime(100);

        const result = await promise.then((value) => `${value}!!`);
        expect(result).toBe("Hello, world!!!");

        expect(promise.isPending).toBe(false);
        expect(promise.isFulfilled).toBe(true);
        expect(promise.isRejected).toBe(false);
    });
    it("Should handle catch callbacks", async () =>
    {
        const promise = new SmartPromise<string>((resolve, reject) =>
        {
            setTimeout(() => reject(new Error("An error occurred")), 100);
        });

        vi.advanceTimersByTime(100);

        const result = await promise.catch((error) => "Recovered from error");
        expect(result).toBe("Recovered from error");

        expect(promise.isPending).toBe(false);
        expect(promise.isFulfilled).toBe(false);
        expect(promise.isRejected).toBe(true);
    });
    it("Should handle finally callbacks", async () =>
    {
        const promise = new SmartPromise<string>((resolve, reject) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);
        });

        vi.advanceTimersByTime(100);

        let finallyCalled = false;
        await promise.finally(() => { finallyCalled = true; });

        expect(finallyCalled).toBe(true);

        expect(promise.isPending).toBe(false);
        expect(promise.isFulfilled).toBe(true);
        expect(promise.isRejected).toBe(false);
    });
});
