import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";

import { DeferredPromise, delay, PromiseQueue } from "../../../src/index.js";

describe("PromiseQueue", () =>
{
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.clearAllTimers());

    it("Should resolve enqueued promise with the executor's result", async () =>
    {
        const _greeting = vi.fn(() => "Hello, world!");
        const _answer = vi.fn(() => Promise.resolve(42));

        const queue = new PromiseQueue();
        expect(queue.isPending).toBe(false);
        expect(queue.isFulfilled).toBe(true);

        const deferred = new DeferredPromise(_greeting);
        queue.enqueue(deferred);

        const response = await deferred;
        expect(queue.isPending).toBe(true);
        expect(queue.isFulfilled).toBe(false);

        const promise = queue.enqueue(_answer);
        expect(queue.isPending).toBe(true);
        expect(queue.isFulfilled).toBe(false);

        const result = await promise;
        expect(queue.isPending).toBe(false);
        expect(queue.isFulfilled).toBe(true);

        expect(_greeting).toHaveBeenCalledTimes(1);
        expect(response).toBe("Hello, world!");

        expect(_answer).toHaveBeenCalledTimes(1);
        expect(result).toBe(42);
    });

    it("Should execute promises in order", async () =>
    {
        const results: number[] = [];
        const queue = new PromiseQueue();

        queue.enqueue(async () =>
        {
            await delay(100);

            results.push(1);
        });
        queue.enqueue(async () =>
        {
            await delay(50);

            results.push(2);
        });
        queue.enqueue(async () =>
        {
            await delay(150);

            results.push(3);
        });
        queue.enqueue(() => { results.push(4); });

        await vi.advanceTimersByTimeAsync(150);
        expect(results).toEqual([1, 2]);

        await vi.advanceTimersByTimeAsync(150);
        expect(results).toEqual([1, 2, 3, 4]);
    });

    it("Should reject if the executor throws", async () =>
    {
        const queue = new PromiseQueue();
        const error = new Error("fail");

        await expect(queue.enqueue(() => { throw error; })).rejects
            .toThrow(error);
    });
});
