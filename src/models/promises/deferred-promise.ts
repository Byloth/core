import type { MaybePromise, PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler } from "../../types.js";

export default class DeferredPromise<T = void, F = T, R = never> extends Promise<F | R>
{
    protected _isPending: boolean;
    protected _isFulfilled: boolean;
    protected _isRejected: boolean;

    protected _resolve!: PromiseResolver<T>;
    protected _reject!: PromiseRejecter;

    public constructor(onFulfilled?: FulfilledHandler<T, F> | null, onRejected?: RejectedHandler<unknown, R> | null)
    {
        super((resolve, reject) =>
        {
            if (onFulfilled)
            {
                this._resolve = async (result) =>
                {
                    this._isPending = false;
                    this._isFulfilled = true;

                    try
                    {
                        const _value = await result;
                        const _result = onFulfilled!(_value);

                        resolve(_result);
                    }
                    catch (error)
                    {
                        this._reject(error);
                    }
                };
            }
            else
            {
                this._resolve = (result: MaybePromise<T>) =>
                {
                    this._isPending = false;
                    this._isFulfilled = true;

                    resolve(result as MaybePromise<F>);
                };
            }

            if (onRejected)
            {
                this._reject = (reason) =>
                {
                    this._isPending = false;
                    this._isRejected = true;

                    try
                    {
                        const _result = onRejected!(reason);

                        resolve(_result);
                    }
                    catch (error)
                    {
                        reject(error);
                    }
                };
            }
            else
            {
                this._reject = (reason) =>
                {
                    this._isPending = false;
                    this._isRejected = true;

                    reject(reason);
                };
            }
        });

        this._isPending = true;
        this._isFulfilled = false;
        this._isRejected = false;
    }

    public get isPending(): boolean { return this._isPending; }
    public get isFulfilled(): boolean { return this._isFulfilled; }
    public get isRejected(): boolean { return this._isRejected; }

    public get resolve(): PromiseResolver<T> { return this._resolve; }
    public get reject(): PromiseRejecter { return this._reject; }

    public watch(promise: Promise<T>): this
    {
        promise.then(this.resolve, this.reject);

        return this;
    }

    public get [Symbol.toStringTag]() { return "DeferredPromise"; }
}
