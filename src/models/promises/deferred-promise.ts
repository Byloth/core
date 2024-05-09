import type { PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler } from "../../types.js";

import SmartPromise from "./smart-promise.js";

export default class DeferredPromise<T = void, F = T, R = never> extends SmartPromise<F | R>
{
    protected _resolve: PromiseResolver<T>;
    protected _reject: PromiseRejecter;

    public constructor(onFulfilled?: FulfilledHandler<T, F> | null, onRejected?: RejectedHandler<unknown, R> | null)
    {
        let _resolve: PromiseResolver<T>;
        let _reject: PromiseRejecter;

        super((resolve, reject) =>
        {
            // ReferenceError: Must call super constructor in derived class before accessing
            //                  'this' or returning from derived constructor.
            //
            _resolve = resolve as PromiseResolver<T>;
            _reject = reject;
        });

        this._promise.then(onFulfilled as FulfilledHandler<F | R>, onRejected);

        this._resolve = _resolve!;
        this._reject = _reject!;
    }

    public get resolve(): PromiseResolver<T> { return this._resolve; }
    public get reject(): PromiseRejecter { return this._reject; }

    public watch(otherPromise: PromiseLike<T>): this
    {
        otherPromise.then(this.resolve, this.reject);

        return this;
    }

    public get [Symbol.toStringTag]() { return "DeferredPromise"; }
}
