import { describe, expect, it, vi } from "vitest";

import { DeferredPromise } from "../../../src/index.js";

describe("DeferredPromise", () =>
{
    it("Should resolve with the correct value", async () =>
    {
        const deferred = new DeferredPromise<string, string[]>((value: string) => value.split(" "));
        deferred.resolve("Hello, world!");

        const result = await deferred;
        expect(result).toEqual(["Hello,", "world!"]);
    });

    it("Should reject with the correct reason", async () =>
    {
        const deferred = new DeferredPromise<string, string[]>((value: string) => value.split(" "));
        const reason = new Error("Something went wrong");

        deferred.reject(reason);

        try
        {
            await deferred;
        }
        catch (error)
        {
            expect(error).toBe(reason);
        }
    });

    it("Should watch another promise and resolve when the other promise resolves", async () =>
    {
        vi.useFakeTimers();

        const otherPromise = new Promise<string>((resolve) => setTimeout(() => resolve("Hello, world!"), 100));
        const deferred = new DeferredPromise<string, string[]>((value: string) => value.split(" "));

        deferred.watch(otherPromise);

        vi.advanceTimersByTime(100);

        const result = await deferred;
        expect(result).toEqual(["Hello,", "world!"]);

        vi.clearAllTimers();
    });

    it("Should watch another promise and reject when the other promise rejects", async () =>
    {
        vi.useFakeTimers();

        const reason = new Error("Something went wrong");
        const otherPromise = new Promise<string>((_, reject) => setTimeout(() => reject(reason), 100));
        const deferred = new DeferredPromise<string, string[]>((value: string) => value.split(" "));

        deferred.watch(otherPromise);

        vi.advanceTimersByTime(100);

        try
        {
            await deferred;
        }
        catch (error)
        {
            expect(error).toBe(reason);
        }

        vi.clearAllTimers();
    });
});
