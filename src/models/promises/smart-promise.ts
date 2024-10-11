import type { FulfilledHandler, PromiseExecutor, RejectedHandler } from "./types.js";

export default class SmartPromise<T = void> implements Promise<T>
{
    public static FromPromise<T>(promise: Promise<T>): SmartPromise<T>
    {
        return new SmartPromise((resolve, reject) => promise.then(resolve, reject));
    }

    protected _isPending: boolean;
    protected _isFulfilled: boolean;
    protected _isRejected: boolean;

    protected _promise: Promise<T>;

    public constructor(executor: PromiseExecutor<T>)
    {
        this._isPending = true;
        this._isFulfilled = false;
        this._isRejected = false;

        const _onFulfilled = (result: T): T =>
        {
            this._isPending = false;
            this._isFulfilled = true;

            return result;
        };
        const _onRejected = (reason: unknown): never =>
        {
            this._isPending = false;
            this._isRejected = true;

            throw reason;
        };

        this._promise = new Promise<T>(executor)
            .then(_onFulfilled, _onRejected);
    }

    public get isPending(): boolean { return this._isPending; }
    public get isFulfilled(): boolean { return this._isFulfilled; }
    public get isRejected(): boolean { return this._isRejected; }

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

    public readonly [Symbol.toStringTag]: string = "SmartPromise";
}
