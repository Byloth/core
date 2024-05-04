import type { FulfilledHandler, PromiseExecutor, RejectedHandler } from "../../types.js";
import { TimeoutException } from "../exceptions/index.js";

export default class TimedPromise<T = void, E = unknown>
{
    protected _isPending: boolean;
    protected _isFulfilled: boolean;
    protected _isRejected: boolean;

    protected _promise: Promise<T>;

    public constructor(executor: PromiseExecutor<T, E>, timeout: number)
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
        const _onRejected = (reason: E): never =>
        {
            this._isPending = false;
            this._isRejected = true;

            throw reason;
        };

        const _executor = new Promise<T>(executor);
        const _timeout = new Promise<never>((_, reject) => setTimeout(() =>
        {
            reject(new TimeoutException("The operation has timed out."));

        }, timeout));

        this._promise = Promise.race([_executor, _timeout])
            .then(_onFulfilled, _onRejected);
    }

    public get isPending(): boolean { return this._isPending; }
    public get isFulfilled(): boolean { return this._isFulfilled; }
    public get isRejected(): boolean { return this._isRejected; }

    public then(onFulfilled?: null): Promise<T | E>;
    public then<F = T | E>(onFulfilled: FulfilledHandler<T | E, F>, onRejected?: null): Promise<F>;
    public then<F = T, R = E>(
        onFulfilled: FulfilledHandler<T, F>,
        onRejected: RejectedHandler<E, R>): Promise<F | R>;
    public then<F = T, R = E>(
        onFulfilled?: FulfilledHandler<T, F> | null,
        onRejected?: RejectedHandler<E, R> | null): Promise<F | R>
    {
        return this._promise.then(onFulfilled as FulfilledHandler<T | E, F>, onRejected);
    }

    public catch(onRejected?: null): Promise<T | E>;
    public catch<R = E>(onRejected: RejectedHandler<E, R>): Promise<T | R>;
    public catch<R = E>(onRejected?: RejectedHandler<E, R> | null): Promise<T | E | R>
    {
        return this._promise.catch(onRejected);
    }

    public finally(onFinally?: (() => void) | null): Promise<T | E>
    {
        return this._promise.finally(onFinally);
    }

    public get [Symbol.toStringTag]() { return "TimedPromise"; }
}
