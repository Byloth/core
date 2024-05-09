import type { PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler } from "../../types.js";

import SmartPromise from "./smart-promise.js";

export default class DeferredPromise<T = void, F = T, R = never> extends SmartPromise<F | R>
{
    protected _resolve!: PromiseResolver<T>;
    protected _reject!: PromiseRejecter;

    public constructor(onFulfilled?: FulfilledHandler<T, F> | null, onRejected?: RejectedHandler<unknown, R> | null)
    {
        super((resolve, reject) =>
        {
            this._resolve = resolve as PromiseResolver<T>;
            this._reject = reject;
        });

        this._promise
            .then(onFulfilled as FulfilledHandler<F | R>, onRejected as RejectedHandler<unknown, R>);
    }

    public get resolve(): PromiseResolver<T> { return this._resolve; }
    public get reject(): PromiseRejecter { return this._reject; }

    public watch(promise: Promise<T>): this
    {
        promise.then(this.resolve, this.reject);

        return this;
    }

    public get [Symbol.toStringTag]() { return "DeferredPromise"; }
}
