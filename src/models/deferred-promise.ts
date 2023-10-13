import type { PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler } from "../types.js";

export default class DeferredPromise<T = void, E = unknown, F = T, R = never>
{
    protected _resolve!: PromiseResolver<T>;
    protected _reject!: PromiseRejecter<E>;

    protected _promise: Promise<F | R>;

    public constructor(onFulfilled?: FulfilledHandler<T, F> | null, onRejected?: RejectedHandler<E, R> | null)
    {
        let _resolve: PromiseResolver<T>;
        let _reject: PromiseRejecter<E>;

        const _promise = new Promise<T>((resolve, reject) =>
        {
            _resolve = resolve as PromiseResolver<T>;
            _reject = reject as PromiseRejecter<E>;
        });

        this._promise = _promise.then(onFulfilled, onRejected);

        this._resolve = _resolve!;
        this._reject = _reject!;
    }

    public get resolve(): PromiseResolver<T>
    {
        return this._resolve;
    }
    public get reject(): PromiseRejecter<E>
    {
        return this._reject;
    }

    public then<N = F | R, H = R>(
        onFulfilled?: FulfilledHandler<F | R, N> | null,
        onRejected?: RejectedHandler<R, H> | null): Promise<N | H>
    {
        return this._promise.then(onFulfilled, onRejected);
    }
    public catch<H = R>(onRejected?: RejectedHandler<R, H> | null): Promise<F | R | H>
    {
        return this._promise.catch(onRejected);
    }
    public finally(onFinally?: (() => void) | null): Promise<F | R>
    {
        return this._promise.finally(onFinally);
    }

    public get [Symbol.toStringTag]()
    {
        return "DeferredPromise";
    }
}
