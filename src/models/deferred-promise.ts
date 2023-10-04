import type { PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler, MaybePromise } from "../types.js";

export default class DeferredPromise<T = void, E = unknown, F = T, R = never>
{
    protected _resolve!: PromiseResolver<T>;
    protected _reject!: PromiseRejecter<E>;

    protected _promise: Promise<F | R>;

    public constructor(onFulfilled?: FulfilledHandler<T, F>, onRejected?: RejectedHandler<E, R>)
    {
        let _resolve: PromiseResolver<T>;
        let _reject: PromiseRejecter<E>;

        const _promise = new Promise<T>((resolve, reject) =>
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
    public reject(reason: E)
    {
        this._reject(reason);
    }

    public then<N = F | R, H = R>(onFulfilled?: FulfilledHandler<F | R, N>, onRejected?: RejectedHandler<R, H>)
        : Promise<N | H>
    {
        return this._promise.then(onFulfilled, onRejected);
    }
    public catch<H = R>(onRejected?: RejectedHandler<R, H>): Promise<F | R | H>
    {
        return this._promise.catch(onRejected);
    }
    public finally(onFinally?: () => void): Promise<F | R>
    {
        return this._promise.finally(onFinally);
    }
}
