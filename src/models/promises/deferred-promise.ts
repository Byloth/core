import type {
    PromiseResolver,
    PromiseRejecter,
    FulfilledHandler,
    RejectedHandler,
    PromiseExecutor

} from "../../types.js";

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

        let _resolve: PromiseResolver<T>;
        let _reject: PromiseRejecter<E>;

        const executor: PromiseExecutor<T, E> = (resolve, reject) =>
        {
            _resolve = resolve;
            _reject = reject;
        };

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

        this._promise = new Promise<T>(executor)
            .then(_onFulfilled, _onRejected);

        this._resolve = _resolve!;
        this._reject = _reject!;
    }

    public get isPending(): boolean { return this._isPending; }
    public get isFulfilled(): boolean { return this._isFulfilled; }
    public get isRejected(): boolean { return this._isRejected; }

    public get resolve(): PromiseResolver<T> { return this._resolve; }
    public get reject(): PromiseRejecter<E> { return this._reject; }

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

    public watch(promise: Promise<T>): this
    {
        promise.then(this.resolve, this.reject);

        return this;
    }

    public get [Symbol.toStringTag]() { return "DeferredPromise"; }
}
