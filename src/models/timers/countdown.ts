import { TimeUnit } from "../../utils/date.js";

import { FatalErrorException, RangeException, RuntimeException } from "../exceptions/index.js";
import { DeferredPromise, SmartPromise } from "../promises/index.js";

import GameLoop from "../game-loop.js";
import Publisher from "../publisher.js";

export default class Countdown extends GameLoop
{
    protected _deferrer?: DeferredPromise<void>;
    protected _publisher: Publisher<[number]>;

    protected _duration: number;
    public get duration(): number
    {
        return this._duration;
    }

    public get remainingTime(): number
    {
        return this._duration - this.elapsedTime;
    }

    public constructor(duration: number, fpsIfNotBrowser: number = TimeUnit.Second)
    {
        const callback = () =>
        {
            const remainingTime = this.remainingTime;
            this._publisher.publish(remainingTime);

            if (remainingTime <= 0) { this.stop(); }
        };

        super(callback, fpsIfNotBrowser);

        this._publisher = new Publisher();
        this._duration = duration;
    }

    public start(remainingTime: number = this.duration): SmartPromise<void>
    {
        if (this._isRunning) { throw new RuntimeException("The countdown has already been started."); }
        if (this._deferrer) { throw new FatalErrorException(); }

        this._deferrer = new DeferredPromise();
        super.start(this.duration - remainingTime);

        return this._deferrer;
    }
    public stop(reason?: unknown): void
    {
        if (!(this._isRunning)) { throw new RuntimeException("The countdown hadn't yet started."); }
        if (!(this._deferrer)) { throw new FatalErrorException(); }

        super.stop();

        if (reason !== undefined) { this._deferrer.reject(reason); }
        else { this._deferrer.resolve(); }

        this._deferrer = undefined;
    }

    public onTick(callback: (remainingTime: number) => void, tickStep = 0): () => void
    {
        if (tickStep < 0) { throw new RangeException("The tick step must be a non-negative number."); }
        if (tickStep === 0) { return this._publisher.subscribe(callback); }

        let lastTick = 0;

        return this._publisher.subscribe((remainingTime: number) =>
        {
            if ((lastTick - remainingTime) < tickStep) { return; }

            callback(remainingTime);
            lastTick = remainingTime;
        });
    }

    public readonly [Symbol.toStringTag]: string = "Countdown";
}
