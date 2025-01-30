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

        promise.then((value) => { expect(value).toBe("Hello, world!"); });

        await vi.advanceTimersByTimeAsync(100);

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

        promise.catch((error) => { expect(error).toEqual(new Error("An error occurred")); });

        await vi.advanceTimersByTimeAsync(100);

        expect(promise.isPending).toBe(false);
        expect(promise.isFulfilled).toBe(false);
        expect(promise.isRejected).toBe(true);
    });

    it("Should wrap an existing promise", async () =>
    {
        const _promise = new Promise<string>((resolve, reject) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);
        });

        const promise = SmartPromise.FromPromise(_promise);
        expect(promise.isPending).toBe(true);
        expect(promise.isFulfilled).toBe(false);
        expect(promise.isRejected).toBe(false);

        promise.then((value) => { expect(value).toBe("Hello, world!"); });

        await vi.advanceTimersByTimeAsync(100);

        expect(promise.isPending).toBe(false);
        expect(promise.isFulfilled).toBe(true);
        expect(promise.isRejected).toBe(false);
    });

    it("Should handle then callbacks", async () =>
    {
        const promise = new SmartPromise<string>((resolve, reject) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);
        });

        promise.then((value) => `${value}!!`)
            .then((value) => { expect(value).toBe("Hello, world!!!"); });

        await vi.advanceTimersByTimeAsync(100);

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

        promise.catch((error) => "Recovered from error")
            .then((value) => { expect(value).toBe("Recovered from error"); });

        await vi.advanceTimersByTimeAsync(100);

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

        let finallyCalled = false;
        promise.finally(() => { finallyCalled = true; });

        await vi.advanceTimersByTimeAsync(100);

        expect(finallyCalled).toBe(true);

        expect(promise.isPending).toBe(false);
        expect(promise.isFulfilled).toBe(true);
        expect(promise.isRejected).toBe(false);
    });
});
