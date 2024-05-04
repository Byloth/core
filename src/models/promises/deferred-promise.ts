import type { PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler } from "../../types.js";

export default class DeferredPromise<T = void, E = unknown, F = T, R = never>
{
    protected _isPending: boolean;
    protected _isFulfilled: boolean;
    protected _isRejected: boolean;

    protected _resolve!: PromiseResolver<T>;
    protected _reject!: PromiseRejecter<E>;

    protected _promise: Promise<F | R>;

    public constructor(onFulfilled?: FulfilledHandler<T, F> | null, onRejected?: RejectedHandler<E, R> | null)
    {
        this._isPending = true;
        this._isFulfilled = false;
        this._isRejected = false;

        let _onFulfilled: FulfilledHandler<T, F>;
        if (onFulfilled)
        {
            _onFulfilled = (value) =>
            {
                this._isPending = false;
                this._isFulfilled = true;

                return onFulfilled!(value);
            };
        }
        else
        {
            _onFulfilled = (value) =>
            {
                this._isPending = false;
                this._isFulfilled = true;

                return (value as unknown) as F;
            };
        }

        let _onRejected: RejectedHandler<E, R>;
        if (onRejected)
        {
            _onRejected = (reason) =>
            {
                this._isPending = false;
                this._isRejected = true;

                return onRejected!(reason);
            };
        }
        else
        {
            _onRejected = (reason) =>
            {
                this._isPending = false;
                this._isRejected = true;

                return (reason as unknown) as R;
            };
        }

        const { promise, resolve, reject } = Promise.withResolvers<T>();

        this._promise = promise.then(_onFulfilled, _onRejected);
        this._resolve = resolve;
        this._reject = reject;
    }

    public get isPending(): boolean { return this._isPending; }
    public get isFulfilled(): boolean { return this._isFulfilled; }
    public get isRejected(): boolean { return this._isRejected; }

    public get resolve(): PromiseResolver<T> { return this._resolve; }
    public get reject(): PromiseRejecter<E> { return this._reject; }

    public then(onFulfilled?: null): Promise<F | R>;
    public then<N = F | R>(onFulfilled: FulfilledHandler<F | R, N>, onRejected?: null): Promise<N>;
    public then<N = F, H = R>(
        onFulfilled: FulfilledHandler<F, N>,
        onRejected: RejectedHandler<R, H>): Promise<N | H>;
    public then<N = F | R, H = R>(
        onFulfilled?: FulfilledHandler<F, N> | null,
        onRejected?: RejectedHandler<R, H> | null): Promise<N | H>
    {
        return this._promise.then(onFulfilled as FulfilledHandler<F | R, N>, onRejected);
    }

    public catch(onRejected?: null): Promise<F | R>;
    public catch<H = R>(onRejected: RejectedHandler<R, H>): Promise<F | H>;
    public catch<H = R>(onRejected?: RejectedHandler<R, H> | null): Promise<F | R | H>
    {
        return this._promise.catch(onRejected);
    }
    public finally(onFinally?: (() => void) | null): Promise<F | R>
    {
        return this._promise.finally(onFinally);
    }

    public watch(promise: Promise<T | E>): this
    {
        promise.then(this.resolve as PromiseResolver<T | E>, this.reject);

        return this;
    }

    public get [Symbol.toStringTag]() { return "DeferredPromise"; }
}
