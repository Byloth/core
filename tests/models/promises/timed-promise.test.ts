import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TimeoutException } from "../../../src/index.js";
import { TimedPromise } from "../../../src/index.js";

describe("TimedPromise", () =>
{
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.clearAllTimers());

    it("Should resolve before timeout", async () =>
    {
        const promise = new TimedPromise<string>((resolve) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);

        }, 500);

        promise.then((result) => { expect(result).toBe("Hello, world!"); });

        await vi.advanceTimersByTimeAsync(500);
    });
    it("Should reject with `TimeoutException` after timeout", async () =>
    {
        const promise = new TimedPromise<string>((resolve) =>
        {
            setTimeout(() => resolve("Hello, world!"), 1_000);

        }, 500);

        promise.catch((error) =>
        {
            expect(error).toBeInstanceOf(TimeoutException);
            expect((error as TimeoutException).message).toBe("The operation has timed out.");
        });

        await vi.advanceTimersByTimeAsync(500);
    });
    it("Should reject with provided reason before timeout", async () =>
    {
        const reason = new Error("An error occurred");
        const promise = new TimedPromise<string>((_, reject) =>
        {
            setTimeout(() => reject(reason), 100);

        }, 500);

        promise.catch((error) => { expect(error).toBe(reason); });

        await vi.advanceTimersByTimeAsync(500);
    });

    it("Should resolve immediately if no timeout is provided", async () =>
    {
        const promise = new TimedPromise<string>((resolve) =>
        {
            resolve("Immediate resolve");
        });

        promise.then((result) => { expect(result).toBe("Immediate resolve"); });
    });
    it("Should reject immediately if no timeout is provided", async () =>
    {
        const promise = new TimedPromise<string>((resolve, reject) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);
        });

        promise.catch((error) =>
        {
            expect(error).toBeInstanceOf(TimeoutException);
            expect((error as TimeoutException).message).toBe("The operation has timed out.");
        });

        await vi.advanceTimersByTimeAsync(100);
    });
});
