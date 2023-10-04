import type {
    PromiseExecutor,
    PromiseResolver,
    PromiseRejecter,
    FulfilledHandler,
    RejectedHandler,
    MaybePromise

} from "../types.js";

export default class DeferredPromise<T>
{
    protected _resolve!: PromiseResolver<T>;
    protected _reject!: PromiseRejecter;

    protected _promise: Promise<T>;

    public constructor(executor?: PromiseExecutor<T>)
    {
        this._promise = new Promise((resolve, reject) =>
        {
            this._resolve = resolve;
            this._reject = reject;

            executor?.(resolve, reject);
        });
    }

    public resolve(value: MaybePromise<T>)
    {
        this._resolve(value);
    }
    public reject(reason: unknown)
    {
        this._reject(reason);
    }

    public then<F = T, R = never>(onFulfilled?: FulfilledHandler<T, F>, onRejected?: RejectedHandler<unknown, R>)
        : Promise<F | R>
    {
        return this._promise.then(onFulfilled, onRejected);
    }
    public catch<R = never>(onRejected?: RejectedHandler<unknown, R>): Promise<T | R>
    {
        return this._promise.catch(onRejected);
    }
    public finally(onFinally?: () => void): Promise<T>
    {
        return this._promise.finally(onFinally);
    }
}
