import { describe, expect, it, vi } from "vitest";

import { delay, nextAnimationFrame, yieldToEventLoop } from "../../src/index.js";
import type { Timeout } from "../../src/index.js";

describe("delay", () =>
{
    it("Should resolve after the specified number of milliseconds", async () =>
    {
        vi.useFakeTimers();

        const milliseconds = 100;

        let resolved = false;
        delay(milliseconds)
            .then(() => { resolved = true; });

        await vi.advanceTimersByTimeAsync(milliseconds - 1);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        expect(resolved).toBe(true);

        vi.clearAllTimers();
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
