import type { FulfilledHandler, PromiseExecutor, RejectedHandler } from "../../types.js";

export default class SmartPromise<T = void, E = unknown>
{
    protected _isPending: boolean;
    protected _isFulfilled: boolean;
    protected _isRejected: boolean;

    protected _promise: Promise<T | E>;

    public constructor(executor: PromiseExecutor<T, E>)
    {
        this._isPending = true;
        this._isFulfilled = false;
        this._isRejected = false;

        const _resolve = (result: T): T =>
        {
            this._isPending = false;
            this._isFulfilled = true;

            return result;
        };
        const _reject = (reason: E): E =>
        {
            this._isPending = false;
            this._isRejected = true;

            return reason;
        };

        this._promise = new Promise<T>(executor)
            .then(_resolve, _reject);
    }

    public get isPending(): boolean { return this._isPending; }
    public get isFulfilled(): boolean { return this._isFulfilled; }
    public get isRejected(): boolean { return this._isRejected; }

    public then<F = T, R = E>(
        onFulfilled?: FulfilledHandler<T | E, F> | null,
        onRejected?: RejectedHandler<E, R> | null): Promise<F | R>
    {
        return this._promise.then(onFulfilled, onRejected);
    }
    public catch<R = E>(onRejected?: RejectedHandler<E, R> | null): Promise<T | E | R>
    {
        return this._promise.catch(onRejected);
    }
    public finally(onFinally?: (() => void) | null): Promise<T | E>
    {
        return this._promise.finally(onFinally);
    }

    public get [Symbol.toStringTag]() { return "SmartPromise"; }
}
