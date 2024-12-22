import { TimeUnit } from "../../utils/date.js";

import { FatalErrorException, RangeException, RuntimeException } from "../exceptions/index.js";
import { DeferredPromise, SmartPromise } from "../promises/index.js";

import Publisher from "../callbacks/publisher.js";
import GameLoop from "../game-loop.js";

interface CountdownEventMap
{
    start: () => void;
    stop: (reason: unknown) => void;
    tick: (remainingTime: number) => void;
    expire: () => void;
}

export default class Countdown extends GameLoop
{
    protected _deferrer?: DeferredPromise<void>;
    protected _publisher: Publisher<CountdownEventMap>;

    protected _duration: number;
    public get duration(): number
    {
        return this._duration;
    }

    public get remainingTime(): number
    {
        return this._duration - this.elapsedTime;
    }

    public constructor(duration: number, msIfNotBrowser: number = TimeUnit.Second)
    {
        const callback = () =>
        {
            const remainingTime = this.remainingTime;
            this._publisher.publish("tick", remainingTime);

            if (remainingTime <= 0)
            {
                this._deferrerStop();

                this._publisher.publish("expire");
            }
        };

        super(callback, msIfNotBrowser);

        this._publisher = new Publisher();
        this._duration = duration;
    }

    protected _deferrerStop(reason?: unknown): void
    {
        if (!(this._isRunning)) { throw new RuntimeException("The countdown hadn't yet started."); }
        if (!(this._deferrer)) { throw new FatalErrorException(); }

        super.stop();

        if (reason !== undefined) { this._deferrer.reject(reason); }
        else { this._deferrer.resolve(); }

        this._deferrer = undefined;
    }

    public override start(remainingTime: number = this.duration): SmartPromise<void>
    {
        if (this._isRunning) { throw new RuntimeException("The countdown has already been started."); }
        if (this._deferrer) { throw new FatalErrorException(); }

        this._deferrer = new DeferredPromise();
        super.start(this.duration - remainingTime);

        this._publisher.publish("start");

        return this._deferrer;
    }
    public override stop(reason?: unknown): void
    {
        this._deferrerStop(reason);

        this._publisher.publish("stop", reason);
    }

    public onExpire(callback: () => void): () => void
    {
        return this._publisher.subscribe("expire", callback);
    }

    public onStart(callback: () => void): () => void
    {
        return this._publisher.subscribe("start", callback);
    }
    public onStop(callback: (reason?: unknown) => void): () => void
    {
        return this._publisher.subscribe("stop", callback);
    }

    public onTick(callback: (remainingTime: number) => void, tickStep = 0): () => void
    {
        if (tickStep < 0) { throw new RangeException("The tick step must be a non-negative number."); }
        if (tickStep === 0) { return this._publisher.subscribe("tick", callback); }

        let lastTick = 0;

        return this._publisher.subscribe("tick", (remainingTime: number) =>
        {
            if ((lastTick - remainingTime) < tickStep) { return; }

            callback(remainingTime);
            lastTick = remainingTime;
        });
    }

    public override readonly [Symbol.toStringTag]: string = "Countdown";
}
