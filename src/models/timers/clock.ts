import { TimeUnit } from "../../utils/date.js";

import { RangeException, RuntimeException } from "../exceptions/index.js";
import GameLoop from "../game-loop.js";
import Publisher from "../publisher.js";

export default class Clock extends GameLoop
{
    protected _starter: Publisher;
    protected _stopper: Publisher;
    protected _ticker: Publisher<[number]>;

    public constructor(msIfNotBrowser: number = TimeUnit.Second)
    {
        super((elapsedTime) => this._ticker.publish(elapsedTime), msIfNotBrowser);

        this._starter = new Publisher();
        this._stopper = new Publisher();
        this._ticker = new Publisher();
    }

    public start(elapsedTime = 0): void
    {
        if (this._isRunning) { throw new RuntimeException("The clock has already been started."); }

        super.start(elapsedTime);

        this._starter.publish();
    }

    public stop(): void
    {
        if (!(this._isRunning)) { throw new RuntimeException("The clock hadn't yet started."); }

        super.stop();

        this._stopper.publish();
    }

    public onStart(callback: () => void): () => void
    {
        return this._starter.subscribe(callback);
    }
    public onStop(callback: () => void): () => void
    {
        return this._stopper.subscribe(callback);
    }

    public onTick(callback: (elapsedTime: number) => void, tickStep = 0): () => void
    {
        if (tickStep < 0) { throw new RangeException("The tick step must be a non-negative number."); }
        if (tickStep === 0) { return this._ticker.subscribe(callback); }

        let lastTick = 0;

        return this._ticker.subscribe((elapsedTime: number) =>
        {
            if ((elapsedTime - lastTick) < tickStep) { return; }

            callback(elapsedTime);
            lastTick = elapsedTime;
        });
    }

    public readonly [Symbol.toStringTag]: string = "Clock";
}
