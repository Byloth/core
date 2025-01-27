import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FatalErrorException, RuntimeException } from "../../src/index.js";
import { GameLoop } from "../../src/index.js";

describe("GameLoop", () =>
{
    let callback: FrameRequestCallback;
    let gameLoop: GameLoop;

    beforeEach(() =>
    {
        callback = vi.fn();
        gameLoop = new GameLoop(callback);

        vi.useFakeTimers();
    });

    afterEach(() => vi.clearAllMocks());

    it("Should initialize with default values", () =>
    {
        expect(gameLoop.startTime).toBe(0);
        expect(gameLoop.isRunning).toBe(false);
    });

    it("Should start the game loop", () =>
    {
        gameLoop.start();

        expect(gameLoop.isRunning).toBe(true);
        expect(callback).toHaveBeenCalled();
    });
    it("Should throw `RuntimeException` if start is called while already running", () =>
    {
        gameLoop.start();

        expect(() => gameLoop.start()).toThrow(RuntimeException);
    });

    it("Should calculate elapsed time correctly", () =>
    {
        gameLoop.start();

        expect(gameLoop.elapsedTime).toBeGreaterThanOrEqual(0);
    });

    it("Should stop the game loop", () =>
    {
        gameLoop.start();
        gameLoop.stop();

        expect(gameLoop.isRunning).toBe(false);
    });
    it("Should throw `RuntimeException` if stop is called while not running", () =>
    {
        expect(() => gameLoop.stop()).toThrow(RuntimeException);
    });

    it("Should throw `FatalErrorException` if stop is called without a handle", () =>
    {
        gameLoop.start();
        gameLoop["_handle"] = undefined;

        expect(() => gameLoop.stop()).toThrow(FatalErrorException);
    });

    it("Should subscribe to start event", () =>
    {
        const _callback = vi.fn();

        gameLoop.onStart(_callback);
        gameLoop.start();

        expect(_callback).toHaveBeenCalled();
    });
    it("Should subscribe to stop event", () =>
    {
        const _callback = vi.fn();

        gameLoop.onStop(_callback);
        gameLoop.start();
        gameLoop.stop();

        expect(_callback).toHaveBeenCalled();
    });
});
