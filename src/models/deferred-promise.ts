import type { PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler, MaybePromise } from "../types.js";

export default class DeferredPromise<T, E = never>
{
    protected _resolve!: PromiseResolver<T>;
    protected _reject!: PromiseRejecter;

    protected _promise: Promise<T | E>;

    public constructor(onFulfilled?: FulfilledHandler<unknown, T>, onRejected?: RejectedHandler<unknown, E>)
    {
        let _resolve: PromiseResolver<T>;
        let _reject: PromiseRejecter;

        const _promise = new Promise<T | E>((resolve, reject) =>
        {
            _resolve = resolve;
            _reject = reject;
        });

        this._promise = _promise.then(onFulfilled, onRejected);

        this._resolve = _resolve!;
        this._reject = _reject!;
    }

    public resolve(value: MaybePromise<T>)
    {
        this._resolve(value);
    }
    public reject(reason: unknown)
    {
        this._reject(reason);
    }

    public then<F = T | E, R = never>(
        onFulfilled?: FulfilledHandler<T | E, F>,
        onRejected?: RejectedHandler<unknown, R>): Promise<F | R>
    {
        return this._promise.then(onFulfilled, onRejected);
    }
    public catch<R = never>(onRejected?: RejectedHandler<unknown, R>): Promise<T | E | R>
    {
        return this._promise.catch(onRejected);
    }
    public finally(onFinally?: () => void): Promise<T | E>
    {
        return this._promise.finally(onFinally);
    }
}
