import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RuntimeException, RangeException } from "../../../src/index.js";
import { Countdown } from "../../../src/index.js";

describe("Countdown", () =>
{
    const duration = 10_000;
    let countdown: Countdown;

    beforeEach(() =>
    {
        countdown = new Countdown(duration);

        vi.useFakeTimers();
    });
    afterEach(() => vi.clearAllTimers());

    it("Should initialize with the correct duration", () =>
    {
        expect(countdown.duration).toBe(duration);
    });
    it("Should calculate remaining time correctly", () =>
    {
        expect(countdown.remainingTime).toBe(duration);
    });

    it("Should start the countdown and publish start event", () =>
    {
        const _callback = vi.fn();

        countdown.onStart(_callback);
        countdown.start();

        expect(_callback).toHaveBeenCalled();
    });
    it("Should throw `RuntimeException` if start is called while running", () =>
    {
        countdown.start();

        expect(() => countdown.start()).toThrow(RuntimeException);
    });

    it("Should stop the countdown and publish stop event", async () =>
    {
        const _callback = vi.fn();

        countdown.onStop(_callback);

        const { rejects } = expect(countdown.start());
        countdown.stop("This is a test!");

        await rejects.toBe("This is a test!");

        expect(_callback).toHaveBeenCalledWith("This is a test!");
    });
    it("Should throw `RuntimeException` if stop is called before start", () =>
    {
        expect(() => countdown.stop()).toThrow(RuntimeException);
    });

    it("Should publish tick events", async () =>
    {
        const _callback = vi.fn();

        countdown.onTick(_callback);
        countdown.start();

        await vi.advanceTimersByTimeAsync(304);

        expect(_callback).toHaveBeenCalledTimes(20);
    });
    it("Should execute tick callback only if elapsed time is greater than tickStep", async () =>
    {
        const _callback = vi.fn();

        countdown.onTick(_callback, 250);
        countdown.start();

        await vi.advanceTimersByTimeAsync(1_024);

        expect(_callback).toHaveBeenCalledTimes(4);
    });

    it("Should publish expire event when time is up", async () =>
    {
        const _callback = vi.fn();

        countdown.onExpire(_callback);
        countdown.start();

        await vi.advanceTimersByTimeAsync(10_000);

        expect(_callback).toHaveBeenCalled();
    });

    it("Should throw `RangeException` if tickStep is negative", () =>
    {
        expect(() => countdown.onTick(() => { /* ... */ }, -1)).toThrow(RangeException);
    });
});
