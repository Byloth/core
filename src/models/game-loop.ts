import type { Interval } from "../core/types.js";
import { isBrowser } from "../helpers.js";

import Publisher from "./callbacks/publisher.js";
import { FatalErrorException, RuntimeException } from "./exceptions/index.js";
import type { Callback } from "./types.js";

interface GameLoopEventMap
{
    start: () => void;
    stop: () => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Callback<any[], any>;
}

/**
 * A class representing a {@link https://en.wikipedia.org/wiki/Video_game_programming#Game_structure|game loop} pattern
 * that allows to run a function at a specific frame rate.
 *
 * In a browser environment, it uses the native {@link requestAnimationFrame}
 * function to run the callback at the refresh rate of the screen.  
 * In a non-browser environment, however, it uses the {@link setInterval}
 * function to run the callback at the specified fixed interval of time.
 *
 * Every time the callback is executed, it receives the
 * elapsed time since the start of the game loop.  
 * It's also possible to subscribe to the `start` & `stop` events to receive notifications when they occur.
 *
 * ```ts
 * const loop = new GameLoop((elapsedTime: number) =>
 * {
 *     console.log(`The game loop has been running for ${elapsedTime}ms.`);
 * });
 *
 * loop.onStart(() => { console.log("The game loop has started."); });
 * loop.onStop(() => { console.log("The game loop has stopped."); });
 *
 * loop.start();
 * ```
 */
export default class GameLoop
{
    /**
     * The handle of the interval or the animation frame, depending on the environment.  
     * It's used to stop the game loop when the {@link GameLoop._stop} method is called.
     */
    protected _handle?: number | Interval;

    /**
     * The time when the game loop has started.  
     * In addition to indicating the {@link https://en.wikipedia.org/wiki/Unix_time|Unix timestamp}
     * of the start of the game loop, it's also used to calculate the elapsed time.
     *
     * This protected property is the only one that can be modified directly by the derived classes.  
     * If you're looking for the public and readonly property, use the {@link GameLoop.startTime} getter instead.
     */
    protected _startTime: number;

    /**
     * The time when the game loop has started.  
     * In addition to indicating the {@link https://en.wikipedia.org/wiki/Unix_time|Unix timestamp}
     * of the start of the game loop, it's also used to calculate the elapsed time.
     */
    public get startTime(): number
    {
        return this._startTime;
    }

    /**
     * A flag indicating whether the game loop is currently running or not.
     *
     * This protected property is the only one that can be modified directly by the derived classes.
     * If you're looking for the public and readonly property, use the {@link GameLoop.isRunning} getter instead.
     */
    protected _isRunning: boolean;

    /**
     * A flag indicating whether the game loop is currently running or not.
     */
    public get isRunning(): boolean
    {
        return this._isRunning;
    }

    /**
     * The elapsed time since the start of the game loop.  
     * It's calculated as the difference between the current time and the {@link GameLoop.startTime}.
     */
    public get elapsedTime(): number
    {
        return performance.now() - this._startTime;
    }

    /**
     * The {@link Publisher} object that will be used to publish the events of the game loop.
     */
    protected _publisher: Publisher<GameLoopEventMap>;

    /**
     * The internal method actually responsible for starting the game loop.
     *
     * Depending on the current environment, it could use the
     * {@link requestAnimationFrame} or the {@link setInterval} function.
     */
    protected _start: () => void;

    /**
     * The internal method actually responsible for stopping the game loop.
     *
     * Depending on the current environment, it could use the
     * {@link cancelAnimationFrame} or the {@link clearInterval} function.
     */
    protected _stop: () => void;

    /**
     * Initializes a new instance of the {@link GameLoop} class.
     *
     * ```ts
     * const loop = new GameLoop((elapsedTime: number) => { [...] });
     * ```
     *
     * ---
     *
     * @param callback The function that will be executed at each iteration of the game loop.
     * @param msIfNotBrowser
     * The interval in milliseconds that will be used if the current environment isn't a browser. Default is `40`.
     */
    public constructor(callback: FrameRequestCallback, msIfNotBrowser = 40)
    {
        this._startTime = 0;
        this._isRunning = false;

        if (isBrowser)
        {
            this._start = () =>
            {
                callback(this.elapsedTime);

                this._handle = window.requestAnimationFrame(this._start);
            };

            this._stop = () => window.cancelAnimationFrame(this._handle as number);
        }
        else
        {
            // eslint-disable-next-line no-console
            console.warn(
                "Not a browser environment detected. " +
                `Using setInterval@${msIfNotBrowser}ms instead of requestAnimationFrame...`
            );

            this._start = () =>
            {
                this._handle = setInterval(() => callback(this.elapsedTime), msIfNotBrowser);
            };

            this._stop = () => clearInterval(this._handle as Interval);
        }

        this._publisher = new Publisher();
    }

    /**
     * Starts the execution of the game loop.
     *
     * If the game loop is already running, a {@link RuntimeException} will be thrown.
     *
     * ```ts
     * loop.onStart(() => { [...] }); // This callback will be executed.
     * loop.start();
     * ```
     *
     * ---
     *
     * @param elapsedTime The elapsed time to set as default when the game loop starts. Default is `0`.
     */
    public start(elapsedTime = 0): void
    {
        if (this._isRunning) { throw new RuntimeException("The game loop has already been started."); }

        this._startTime = performance.now() - elapsedTime;
        this._start();
        this._isRunning = true;

        this._publisher.publish("start");
    }

    /**
     * Stops the execution of the game loop.
     *
     * If the game loop hasn't yet started, a {@link RuntimeException} will be thrown.
     *
     * ```ts
     * loop.onStop(() => { [...] }); // This callback will be executed.
     * loop.stop();
     * ```
     */
    public stop(): void
    {
        if (!(this._isRunning))
        {
            throw new RuntimeException("The game loop had already stopped or hadn't yet started.");
        }
        if (!(this._handle)) { throw new FatalErrorException(); }

        this._stop();
        this._handle = undefined;
        this._isRunning = false;

        this._publisher.publish("stop");
    }

    /**
     * Subscribes to the `start` event of the game loop.
     *
     * ```ts
     * loop.onStart(() => { console.log("The game loop has started."); });
     * ```
     *
     * ---
     *
     * @param callback The function that will be executed when the game loop starts.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    public onStart(callback: () => void): () => void
    {
        return this._publisher.subscribe("start", callback);
    }

    /**
     * Subscribes to the `stop` event of the game loop.
     *
     * ```ts
     * loop.onStop(() => { console.log("The game loop has stopped."); });
     * ```
     *
     * ---
     *
     * @param callback The function that will be executed when the game loop stops.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    public onStop(callback: () => void): () => void
    {
        return this._publisher.subscribe("stop", callback);
    }

    public readonly [Symbol.toStringTag]: string = "GameLoop";
}
