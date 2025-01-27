import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Clock } from "../../../src/index.js";
import { FatalErrorException, RangeException, RuntimeException } from "../../../src/index.js";

describe("Clock", () =>
{
    let clock: Clock;

    beforeEach(() =>
    {
        clock = new Clock();

        vi.useFakeTimers();
    });
    afterEach(() => vi.clearAllMocks());

    it("Should start the clock and publish start event", () =>
    {
        const _callback = vi.fn();

        clock.onStart(_callback);
        clock.start();

        expect(_callback).toHaveBeenCalled();
        expect(clock.isRunning).toBe(true);
    });
    it("Should throw `RuntimeException` if start is called when clock is already running", () =>
    {
        clock.start();

        expect(() => clock.start()).toThrow(RuntimeException);
    });

    it("Should stop the clock and publish stop event", () =>
    {
        const _callback = vi.fn();

        clock.onStop(_callback);
        clock.start();
        clock.stop();

        expect(_callback).toHaveBeenCalled();
        expect(clock.isRunning).toBe(false);
    });
    it("Should throw `RuntimeException` if stop is called when clock isn't running", () =>
    {
        expect(() => clock.stop()).toThrow(RuntimeException);
    });

    it("Should throw `FatalErrorException` if stop is called without a handle", () =>
    {
        clock.start();
        clock["_handle"] = undefined;

        expect(() => clock.stop()).toThrow(FatalErrorException);
    });

    it("Should publish tick event at each tick", () =>
    {
        const _callback = vi.fn();

        clock.onTick(_callback);
        clock.start();

        vi.advanceTimersByTime(304);

        expect(_callback).toHaveBeenCalledTimes(20);
    });

    it("Should execute tick callback only if elapsed time is greater than tickStep", () =>
    {
        const _callback = vi.fn();

        clock.onTick(_callback, 600);
        clock.start();

        vi.advanceTimersByTime(200);
        expect(_callback).toHaveBeenCalledTimes(0);

        vi.advanceTimersByTime(1400);
        expect(_callback).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(1000);
        expect(_callback).toHaveBeenCalledTimes(4);
    });
    it("Should throw `RangeException` if tickStep is negative", () =>
    {
        expect(() => clock.onTick(() => { /* ... */ }, -1)).toThrow(RangeException);
    });
});
