import { TimeUnit } from "../../utils/date.js";

import { RangeException, RuntimeException } from "../exceptions/index.js";
import GameLoop from "../game-loop.js";
import Publisher from "../publisher.js";

export default class Clock extends GameLoop
{
    protected _publisher: Publisher<[number]>;

    public constructor(fpsIfNotBrowser = TimeUnit.Second)
    {
        super((elapsedTime) => this._publisher.publish(elapsedTime), fpsIfNotBrowser);

        this._publisher = new Publisher();
    }

    public start(elapsedTime = 0): void
    {
        if (this._isRunning) { throw new RuntimeException("The clock has already been started."); }

        super.start(elapsedTime);
    }

    public stop(): void
    {
        if (!(this._isRunning)) { throw new RuntimeException("The clock hadn't yet started."); }

        super.stop();
    }

    public onTick(callback: (elapsedTime: number) => void, tickStep = 0): () => void
    {
        if (tickStep < 0) { throw new RangeException("The tick step must be a non-negative number."); }
        if (tickStep === 0) { return this._publisher.subscribe(callback); }

        let lastTick = 0;

        return this._publisher.subscribe((elapsedTime: number) =>
        {
            if ((elapsedTime - lastTick) < tickStep) { return; }

            callback(elapsedTime);
            lastTick = elapsedTime;
        });
    }
}
