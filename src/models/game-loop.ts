import { isBrowser } from "../helpers.js";
import { TimeUnit } from "../utils/date.js";

import { FatalErrorException, RuntimeException } from "./exceptions/index.js";

export default class GameLoop
{
    protected _handle?: number;

    protected _startTime: number;
    public get startTime(): number
    {
        return this._startTime;
    }

    protected _isRunning: boolean;
    public get isRunning(): boolean
    {
        return this._isRunning;
    }

    public get elapsedTime(): number
    {
        return performance.now() - this._startTime;
    }

    protected _start: () => void;
    protected _stop: () => void;

    public constructor(callback: FrameRequestCallback, fpsIfNotBrowser = 30)
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

            this._stop = () => window.cancelAnimationFrame(this._handle!);
        }
        else
        {
            // eslint-disable-next-line no-console
            console.warn(
                "Not a browser environment detected. " +
                `Using setInterval@${fpsIfNotBrowser}fps instead of requestAnimationFrame...`
            );

            this._start = () =>
            {
                const delay = (TimeUnit.Second / fpsIfNotBrowser);

                this._handle = (setInterval(() => callback(this.elapsedTime), delay) as unknown) as number;
            };

            this._stop = () => clearInterval(this._handle!);
        }
    }

    public start(elapsedTime = 0): void
    {
        if (this._isRunning) { throw new RuntimeException("The game loop has already been started."); }

        this._startTime = performance.now() - elapsedTime;
        this._start();
        this._isRunning = true;
    }

    public stop(): void
    {
        if (!(this._isRunning)) { throw new RuntimeException("The game loop hadn't yet started."); }
        if (!(this._handle)) { throw new FatalErrorException(); }

        this._stop();
        this._handle = undefined;
        this._isRunning = false;
    }
}
