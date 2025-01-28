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

        vi.advanceTimersByTime(500);

        const result = await promise;
        expect(result).toBe("Hello, world!");
    });
    it("Should reject with `TimeoutException` after timeout", async () =>
    {
        const promise = new TimedPromise<string>((resolve) =>
        {
            setTimeout(() => resolve("Hello, world!"), 1_000);

        }, 500);

        vi.advanceTimersByTime(500);

        try
        {
            await promise;
        }
        catch (error)
        {
            expect(error).toBeInstanceOf(TimeoutException);
            expect((error as TimeoutException).message).toBe("The operation has timed out.");
        }
    });
    it("Should reject with provided reason before timeout", async () =>
    {
        const reason = new Error("An error occurred");
        const promise = new TimedPromise<string>((_, reject) =>
        {
            setTimeout(() => reject(reason), 100);

        }, 500);

        vi.advanceTimersByTime(500);

        try
        {
            await promise;
        }
        catch (error)
        {
            expect(error).toBe(reason);
        }
    });

    it("Should resolve immediately if no timeout is provided", async () =>
    {
        const result = await new TimedPromise<string>((resolve) =>
        {
            resolve("Immediate resolve");
        });

        expect(result).toBe("Immediate resolve");
    });
    it("Should reject immediately if no timeout is provided", async () =>
    {
        const promise = new TimedPromise<string>((resolve, reject) =>
        {
            setTimeout(() => resolve("Hello, world!"), 100);
        });

        vi.advanceTimersByTime(100);

        try
        {
            await promise;
        }
        catch (error)
        {
            expect(error).toBeInstanceOf(TimeoutException);
            expect((error as TimeoutException).message).toBe("The operation has timed out.");
        }
    });
});
