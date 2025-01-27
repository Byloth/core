import { describe, expect, it, vi } from "vitest";

import { delay, nextAnimationFrame, yieldToEventLoop } from "../../src/index.js";
import type { Timeout } from "../../src/index.js";

describe("delay", () =>
{
    it("Should resolve after the specified number of milliseconds", async () =>
    {
        let milliseconds = 100;

        const start = Date.now();
        await delay(milliseconds);
        const difference = Date.now() - start;

        milliseconds -= 1;
        expect(difference).toBeGreaterThanOrEqual(milliseconds);

        milliseconds += (milliseconds / 10);
        expect(difference).toBeLessThan(milliseconds);
    });
});

describe("nextAnimationFrame", () =>
{
    it("Should resolve on the next animation frame", async () =>
    {
        const _requestAnimationFrame = vi.spyOn(window, "requestAnimationFrame")
            .mockImplementation((callback) =>
            {
                callback(0);

                return -1;
            });

        await nextAnimationFrame();
        expect(_requestAnimationFrame).toHaveBeenCalled();

        _requestAnimationFrame.mockRestore();
    });
});

describe("yieldToEventLoop", () =>
{
    it("Should resolve on the next microtask", async () =>
    {
        const setTimeoutSpy = vi.spyOn(window, "setTimeout")
            .mockImplementation((callback): Timeout =>
            {
                callback();

                return (-1 as unknown) as Timeout;
            });

        await yieldToEventLoop();
        expect(setTimeoutSpy).toHaveBeenCalled();

        setTimeoutSpy.mockRestore();
    });
});
