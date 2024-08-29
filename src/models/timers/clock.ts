import { TimeUnit } from "../../utils/date.js";

import { RangeException } from "../exceptions/index.js";
import GameLoop from "../game-loop.js";
import Publisher from "../publisher.js";

export default class Clock extends GameLoop
{
    protected _publisher: Publisher<[number], void>;

    public constructor(fpsIfNotBrowser = TimeUnit.Second)
    {
        super((elapsedTime) => this._publisher.publish(elapsedTime), fpsIfNotBrowser);

        this._publisher = new Publisher();
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
