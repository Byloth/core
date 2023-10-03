import type { PromiseExecutor, PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler } from "../types.js";

export default class DeferredPromise<T, E = unknown> extends Promise<T>
{
    protected _resolve: PromiseResolver<T>;
    protected _reject: PromiseRejecter<E>;

    public get resolve(): PromiseResolver<T>
    {
        return this._resolve;
    }
    public get reject(): PromiseRejecter<E>
    {
        return this._reject;
    }

    public constructor(executor?: PromiseExecutor<T>)
    {
        let _resolve: PromiseResolver<T>;
        let _reject: PromiseRejecter<E>;

        let _executor: PromiseExecutor<T>;

        if (executor)
        {
            _executor = (resolve, reject) =>
            {
                _resolve = resolve;
                _reject = reject;

                executor(resolve, reject);
            };
        }
        else
        {
            _executor = (resolve, reject) =>
            {
                _resolve = resolve;
                _reject = reject;
            };
        }

        super(_executor);

        this._resolve = _resolve!;
        this._reject = _reject!;
    }

    public then<F = T, R = E>(onFulfilled?: FulfilledHandler<T, F> | null, onRejected?: RejectedHandler<E, R>)
        : DeferredPromise<F, R>
    {
        super.then(onFulfilled, onRejected);

        return (this as unknown) as DeferredPromise<F, R>;
    }
    public catch<R = E>(onRejected?: RejectedHandler<E, R>): DeferredPromise<T, R>
    {
        super.catch(onRejected);

        return (this as unknown) as DeferredPromise<T, R>;
    }
    public finally(onFinally?: (() => void) | null): DeferredPromise<T, E>
    {
        super.finally(onFinally);

        return this;
    }
}
