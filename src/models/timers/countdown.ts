import { TimeUnit } from "../../utils/date.js";

import Publisher from "../callbacks/publisher.js";
import { FatalErrorException, RangeException, RuntimeException } from "../exceptions/index.js";
import { DeferredPromise, SmartPromise } from "../promises/index.js";
import type { Callback } from "../types.js";

import GameLoop from "./game-loop.js";

interface CountdownEventsMap
{
    start: () => void;
    stop: (reason: unknown) => void;
    tick: (remainingTime: number) => void;
    expire: () => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Callback<any[], any>;
}

/**
 * A class representing a countdown.
 *
 * It can be started, stopped, when running it ticks at a specific frame rate and it expires when the time's up.  
 * It's possible to subscribe to these events to receive notifications when they occur.
 *
 * ---
 *
 * @example
 * ```ts
 * const countdown = new Countdown(10_000);
 *
 * countdown.onStart(() => { console.log("The countdown has started."); });
 * countdown.onTick((remainingTime) => { console.log(`The countdown has ${remainingTime}ms remaining.`); });
 * countdown.onStop((reason) => { console.log(`The countdown has stopped because of ${reason}.`); });
 * countdown.onExpire(() => { console.log("The countdown has expired."); });
 *
 * countdown.start();
 * ```
 */
export default class Countdown extends GameLoop
{
    /**
     * The {@link Publisher} object that will be used to publish the events of the countdown.
     */
    declare protected readonly _publisher: Publisher<CountdownEventsMap>;

    /**
     * The total duration of the countdown in milliseconds.
     *
     * This protected property is the only one that can be modified directly by the derived classes.  
     * If you're looking for the public and readonly property, use the {@link Countdown.duration} getter instead.
     */
    protected _duration: number;

    /**
     * The total duration of the countdown in milliseconds.
     */
    public get duration(): number
    {
        return this._duration;
    }

    /**
     * The remaining time of the countdown in milliseconds.  
     * It's calculated as the difference between the total duration and the elapsed time.
     */
    public get remainingTime(): number
    {
        return this._duration - this.elapsedTime;
    }

    /**
     * The {@link DeferredPromise} that will be resolved or rejected when the countdown expires or stops.
     */
    protected _deferrer?: DeferredPromise<void>;

    /**
     * Initializes a new instance of the {@link Countdown} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const countdown = new Countdown(10_000);
     * ```
     *
     * ---
     *
     * @param duration
     * The total duration of the countdown in milliseconds.
     *
     * @param msIfNotBrowser
     * The interval in milliseconds at which the countdown will tick if the environment is not a browser.  
     * `TimeUnit.Second` by default.
     */
    public constructor(duration: number, msIfNotBrowser: number = TimeUnit.Second)
    {
        const callback = () =>
        {
            const remainingTime = this.remainingTime;
            if (remainingTime <= 0)
            {
                this._deferrerStop();

                this._publisher.publish("tick", 0);
                this._publisher.publish("expire");
            }
            else
            {
                this._publisher.publish("tick", remainingTime);
            }
        };

        super(callback, msIfNotBrowser);

        this._duration = duration;
    }

    /**
     * The internal method actually responsible for stopping the
     * countdown and resolving or rejecting the {@link Countdown._deferrer} promise.
     *
     * ---
     *
     * @param reason
     * The reason why the countdown has stopped.
     *
     * - If it's `undefined`, the promise will be resolved.
     * - If it's a value, the promise will be rejected with that value.
     */
    protected _deferrerStop(reason?: unknown): void
    {
        if (!(this._isRunning)) { throw new RuntimeException("The countdown hadn't yet started."); }
        if (!(this._deferrer)) { throw new FatalErrorException(); }

        this._stop();
        this._handle = undefined;
        this._isRunning = false;

        if (reason !== undefined) { this._deferrer.reject(reason); }
        else { this._deferrer.resolve(); }

        this._deferrer = undefined;
    }

    /**
     * Starts the execution of the countdown.
     *
     * If the countdown is already running, a {@link RuntimeException} will be thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * countdown.onStart(() => { [...] }); // This callback will be executed.
     * countdown.start();
     * ```
     *
     * ---
     *
     * @param remainingTime
     * The remaining time to set as default when the countdown starts.  
     * Default is the {@link Countdown.duration} itself.
     *
     * @returns A {@link SmartPromise} that will be resolved or rejected when the countdown expires or stops.
     */
    public override start(remainingTime: number = this.duration): SmartPromise<void>
    {
        if (this._isRunning) { throw new RuntimeException("The countdown had already stopped or hadn't yet started."); }
        if (this._deferrer) { throw new FatalErrorException(); }

        this._deferrer = new DeferredPromise();
        super.start(this.duration - remainingTime);

        this._publisher.publish("start");

        return this._deferrer;
    }

    /**
     * Stops the execution of the countdown.
     *
     * If the countdown hasn't yet started, a {@link RuntimeException} will be thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * countdown.onStop(() => { [...] }); // This callback will be executed.
     * countdown.stop();
     * ```
     *
     * ---
     *
     * @param reason
     * The reason why the countdown has stopped.
     *
     * - If it's `undefined`, the promise will be resolved.
     * - If it's a value, the promise will be rejected with that value.
     */
    public override stop(reason?: unknown): void
    {
        // TODO: Once solved Issues #6 & #10, make the `reason` parameter required.
        //       - https://github.com/Byloth/core/issues/6
        //       - https://github.com/Byloth/core/issues/10
        //
        this._deferrerStop(reason);

        this._publisher.publish("stop", reason);
    }

    /**
     * Subscribes to the `expire` event of the countdown.
     *
     * ---
     *
     * @example
     * ```ts
     * countdown.onExpire(() => { [...] }); // This callback will be executed once the countdown has expired.
     * countdown.start();
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when the countdown expires.
     *
     * @returns A function that can be used to unsubscribe from the event.
     */
    public onExpire(callback: () => void): () => void
    {
        return this._publisher.subscribe("expire", callback);
    }

    /**
     * Subscribes to the `tick` event of the countdown.
     *
     * ---
     *
     * @example
     * ```ts
     * countdown.onTick((remainingTime) => { [...] }); // This callback will be executed.
     * countdown.start();
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when the countdown ticks.
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
    public onTick(callback: (remainingTime: number) => void, tickStep = 0): () => void
    {
        if (tickStep < 0) { throw new RangeException("The tick step must be a non-negative number."); }
        if (tickStep === 0) { return this._publisher.subscribe("tick", callback); }

        let lastTick = this.remainingTime;

        return this._publisher.subscribe("tick", (remainingTime: number) =>
        {
            if ((lastTick - remainingTime) < tickStep) { return; }

            callback(remainingTime);
            lastTick = remainingTime;
        });
    }

    public override readonly [Symbol.toStringTag]: string = "Countdown";
}
