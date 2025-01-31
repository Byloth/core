import { TimeUnit } from "../../utils/date.js";

import Publisher from "../callbacks/publisher.js";
import { FatalErrorException, RangeException, RuntimeException } from "../exceptions/index.js";
import type { Callback } from "../types.js";

import GameLoop from "./game-loop.js";

interface ClockEventMap
{
    start: () => void;
    stop: () => void;
    tick: (elapsedTime: number) => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Callback<any[], any>;
}

/**
 * A class representing a clock.
 *
 * It can be started, stopped and, when running, it ticks at a specific frame rate.  
 * It's possible to subscribe to these events to receive notifications when they occur.
 *
 * ```ts
 * const clock = new Clock();
 *
 * clock.onStart(() => { console.log("The clock has started."); });
 * clock.onTick((elapsedTime) => { console.log(`The clock has ticked at ${elapsedTime}ms.`); });
 * clock.onStop(() => { console.log("The clock has stopped."); });
 *
 * clock.start();
 * ```
 */
export default class Clock extends GameLoop
{
    /**
     * The {@link Publisher} object that will be used to publish the events of the clock.
     */
    protected override _publisher: Publisher<ClockEventMap>;

    /**
     * Initializes a new instance of the {@link Clock} class.
     *
     * ```ts
     * const clock = new Clock();
     * ```
     *
     * @param msIfNotBrowser
     * The interval in milliseconds at which the clock will tick if the environment is not a browser.  
     * `TimeUnit.Second` by default.
     */
    public constructor(msIfNotBrowser: number = TimeUnit.Second)
    {
        super((elapsedTime) => this._publisher.publish("tick", elapsedTime), msIfNotBrowser);

        this._publisher = new Publisher();
    }

    /**
     * Starts the execution of the clock.
     *
     * If the clock is already running, a {@link RuntimeException} will be thrown.
     *
     * ```ts
     * clock.onStart(() => { [...] }); // This callback will be executed.
     * clock.start();
     * ```
     *
     * @param elapsedTime The elapsed time to set as default when the clock starts. Default is `0`.
     */
    public override start(elapsedTime = 0): void
    {
        if (this._isRunning) { throw new RuntimeException("The clock has already been started."); }

        this._startTime = performance.now() - elapsedTime;
        this._start();
        this._isRunning = true;

        this._publisher.publish("start");
    }

    /**
     * Stops the execution of the clock.
     *
     * If the clock hasn't yet started, a {@link RuntimeException} will be thrown.
     *
     * ```ts
     * clock.onStop(() => { [...] }); // This callback will be executed.
     * clock.stop();
     * ```
     */
    public override stop(): void
    {
        if (!(this._isRunning)) { throw new RuntimeException("The clock had already stopped or hadn't yet started."); }
        if (!(this._handle)) { throw new FatalErrorException(); }

        this._stop();
        this._handle = undefined;
        this._isRunning = false;

        this._publisher.publish("stop");
    }

    /**
     * Subscribes to the `tick` event of the clock.
     *
     * ```ts
     * clock.onTick((elapsedTime) => { [...] }); // This callback will be executed.
     * clock.start();
     * ```
     *
     * @param callback The callback that will be executed when the clock ticks.
     * @param tickStep
     * The minimum time in milliseconds that must pass from the previous execution of the callback to the next one.
     *
     * - If it's a positive number, the callback will be executed only if the
     * time passed from the previous execution is greater than this number.
     * - If it's `0`, the callback will be executed every tick without even checking for the time.
     * - If it's a negative number, a {@link RangeException} will be thrown.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    public onTick(callback: (elapsedTime: number) => void, tickStep = 0): () => void
    {
        if (tickStep < 0) { throw new RangeException("The tick step must be a non-negative number."); }
        if (tickStep === 0) { return this._publisher.subscribe("tick", callback); }

        let lastTick = 0;

        return this._publisher.subscribe("tick", (elapsedTime: number) =>
        {
            if ((elapsedTime - lastTick) < tickStep) { return; }

            callback(elapsedTime);
            lastTick = elapsedTime;
        });
    }

    public override readonly [Symbol.toStringTag]: string = "Clock";
}
