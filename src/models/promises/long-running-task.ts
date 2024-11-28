import { yieldToEventLoop } from "../../utils/async.js";

import Publisher from "../callbacks/publisher.js";
import { RuntimeException } from "../exceptions/index.js";

import type { MaybeAsyncGeneratorFunction } from "../iterators/types.js";
import type { FulfilledHandler, PromiseExecutor, RejectedHandler } from "./types.js";

export interface LongRunningTaskOptions
{
    ignoreErrors?: boolean;
    stepIncrement?: number;
    totalSteps?: number | null;
    trackProgress?: boolean;
}

export default class LongRunningTask<T = void> implements Promise<T>
{
    private static get _DefaultOptions(): Required<LongRunningTaskOptions>
    {
        return {
            ignoreErrors: false,
            stepIncrement: 1,
            totalSteps: null,
            trackProgress: false
        };
    }

    protected _startTime: number;
    protected _estimatedTime: number;
    protected _endTime?: number;

    protected _currentStep: number;
    protected _percentage: number;

    protected _isRunning: boolean;
    protected _hasCompleted: boolean;
    protected _hasFailed: boolean;

    protected _promise: Promise<T>;
    protected _publisher?: Publisher;

    public constructor(executor: MaybeAsyncGeneratorFunction<undefined, T>, options?: LongRunningTaskOptions);
    public constructor(executor: MaybeAsyncGeneratorFunction<number, T>, options?: LongRunningTaskOptions);
    public constructor(executor: MaybeAsyncGeneratorFunction<number | undefined, T>, options?: LongRunningTaskOptions)
    {
        this._startTime = 0;
        this._estimatedTime = 0;

        this._currentStep = 0;
        this._percentage = 0;

        this._isRunning = true;
        this._hasCompleted = false;
        this._hasFailed = false;

        const _onFulfilled = (result: T): T =>
        {
            this._estimatedTime = 0;
            this._endTime = Date.now();

            this._percentage = 100;

            this._isRunning = false;
            this._hasCompleted = true;

            return result;
        };
        const _onRejected = (reason: unknown): never =>
        {
            this._endTime = Date.now();

            this._isRunning = false;
            this._hasFailed = true;

            throw reason;
        };

        let _executor: PromiseExecutor<T>;

        options = { ...LongRunningTask._DefaultOptions, ...options };
        if ((options.trackProgress))
        {
            let _trackProgress: (steps: number | undefined) => void;

            this._publisher = new Publisher();

            if (options.totalSteps)
            {
                if (options.stepIncrement)
                {
                    _trackProgress = (steps: number | undefined) =>
                    {
                        if (steps) { this._currentStep += steps; }
                        else { this._currentStep += options.stepIncrement!; }

                        this._percentage = (this._currentStep / options.totalSteps!) * 100;

                        const elapsedTime = Date.now() - this._startTime;
                        const remainingSteps = options.totalSteps! - this._currentStep;
                        this._estimatedTime = (elapsedTime / this._currentStep) * remainingSteps;
                    };
                }
                else
                {
                    _trackProgress = (steps: number | undefined) =>
                    {
                        if (steps)
                        {
                            this._currentStep += steps;
                            this._percentage = (this._currentStep / options.totalSteps!) * 100;

                            const elapsedTime = Date.now() - this._startTime;
                            const remainingSteps = options.totalSteps! - this._currentStep;
                            this._estimatedTime = (elapsedTime / this._currentStep) * remainingSteps;
                        }
                    };
                }
            }
            else if (options.stepIncrement)
            {
                _trackProgress = (steps: number | undefined) =>
                {
                    if (steps) { this._currentStep += steps; }
                    else { this._currentStep += options.stepIncrement!; }
                };
            }
            else
            {
                _trackProgress = (steps: number | undefined) =>
                {
                    if (steps) { this._currentStep += steps; }
                };
            }

            if (options.ignoreErrors)
            {
                _executor = async (resolve) =>
                {
                    const generator = executor();
                    this._startTime = Date.now();

                    while (true)
                    {
                        try
                        {
                            const { done, value } = await generator.next();

                            if (done) { return resolve(value); }
                            else { _trackProgress(value); }
                        }

                        // eslint-disable-next-line no-console
                        catch (error) { console.error(error); }

                        this._publisher!.publish("progress");

                        await yieldToEventLoop();
                    }
                };
            }
            else
            {
                _executor = async (resolve, reject) =>
                {
                    try
                    {
                        const generator = executor();
                        this._startTime = Date.now();

                        while (true)
                        {
                            const { done, value } = await generator.next();
                            if (done) { return resolve(value); }
                            else { _trackProgress(value); }

                            this._publisher!.publish("progress");

                            await yieldToEventLoop();
                        }
                    }
                    catch (error) { reject(error); }
                };
            }
        }
        else if (options.ignoreErrors)
        {
            _executor = async (resolve) =>
            {
                const generator = executor();
                this._startTime = Date.now();

                while (true)
                {
                    try
                    {
                        const { done, value } = await generator.next();
                        if (done) { return resolve(value); }
                    }

                    // eslint-disable-next-line no-console
                    catch (error) { console.error(error); }

                    await yieldToEventLoop();
                }
            };
        }
        else
        {
            _executor = async (resolve, reject) =>
            {
                try
                {
                    const generator = executor();
                    this._startTime = Date.now();

                    while (true)
                    {
                        const { done, value } = await generator.next();
                        if (done) { return resolve(value); }

                        await yieldToEventLoop();
                    }
                }
                catch (error) { reject(error); }
            };
        }

        this._promise = new Promise(_executor)
            .then(_onFulfilled, _onRejected);
    }

    public get startTime(): number { return this._startTime; }
    public get elapsedTime(): number
    {
        if (this._isRunning) { return Date.now() - this._startTime; }

        return this._endTime! - this._startTime;
    }
    public get estimatedTime(): number { return this._estimatedTime; }
    public get endTime(): number
    {
        if (this._isRunning)
        {
            throw new RuntimeException("The task is still running and has no end time yet.");
        }

        return this._endTime!;
    }

    public get currentStep(): number { return this._currentStep; }
    public get percentage(): number { return this._percentage; }

    public get isRunning(): boolean { return this._isRunning; }
    public get hasCompleted(): boolean { return this._hasCompleted; }
    public get hasFailed(): boolean { return this._hasFailed; }

    public then(onFulfilled?: null): Promise<T>;
    public then<F = T>(onFulfilled: FulfilledHandler<T, F>, onRejected?: null): Promise<F>;
    public then<F = T, R = never>(onFulfilled: FulfilledHandler<T, F>, onRejected: RejectedHandler<unknown, R>)
        : Promise<F | R>;
    public then<F = T, R = never>(
        onFulfilled?: FulfilledHandler<T, F> | null,
        onRejected?: RejectedHandler<unknown, R> | null): Promise<F | R>
    {
        return this._promise.then(onFulfilled, onRejected);
    }

    public catch(onRejected?: null): Promise<T>;
    public catch<R = never>(onRejected: RejectedHandler<unknown, R>): Promise<T | R>;
    public catch<R = never>(onRejected?: RejectedHandler<unknown, R> | null): Promise<T | R>
    {
        return this._promise.catch(onRejected);
    }
    public finally(onFinally?: (() => void) | null): Promise<T>
    {
        return this._promise.finally(onFinally);
    }

    public onProgress(callback: () => void): () => void
    {
        if (!(this._publisher))
        {
            throw new RuntimeException(
                "You cannot subscribe to progress events without enabling progress tracking. " +
                "Did you forget to set the `trackProgress` option to `true` when creating the task?"
            );
        }

        return this._publisher.subscribe("progress", callback);
    }

    public readonly [Symbol.toStringTag]: string = "LongRunningTask";
}
