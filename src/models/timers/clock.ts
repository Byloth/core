import { TimeUnit } from "../../utils/date.js";
import { RangeException, RuntimeException } from "../exceptions/index.js";

import Publisher from "../callbacks/publisher.js";
import GameLoop from "../game-loop.js";

interface ClockEventMap
{
    start: () => void;
    stop: () => void;
    tick: (elapsedTime: number) => void;
}

export default class Clock extends GameLoop
{
    protected _publisher: Publisher<ClockEventMap>;

    public constructor(msIfNotBrowser: number = TimeUnit.Second)
    {
        super((elapsedTime) => this._publisher.publish("tick", elapsedTime), msIfNotBrowser);

        this._publisher = new Publisher();
    }

    public start(elapsedTime = 0): void
    {
        if (this._isRunning) { throw new RuntimeException("The clock has already been started."); }

        super.start(elapsedTime);

        this._publisher.publish("start");
    }

    public stop(): void
    {
        if (!(this._isRunning)) { throw new RuntimeException("The clock hadn't yet started."); }

        super.stop();

        this._publisher.publish("stop");
    }

    public onStart(callback: () => void): () => void
    {
        return this._publisher.subscribe("start", callback);
    }
    public onStop(callback: () => void): () => void
    {
        return this._publisher.subscribe("stop", callback);
    }

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

    public readonly [Symbol.toStringTag]: string = "Clock";
}
