import type { MaybePromise, PromiseExecutor } from "../../types.js";

export default class SmartPromise<T = void> extends Promise<T>
{
    protected _isPending: boolean;
    protected _isFulfilled: boolean;
    protected _isRejected: boolean;

    public constructor(executor: PromiseExecutor<T>)
    {
        super((resolve, reject) =>
        {
            const _resolve = (result: MaybePromise<T>) =>
            {
                this._isPending = false;
                this._isFulfilled = true;

                resolve(result);
            };
            const _reject = (reason: unknown) =>
            {
                this._isPending = false;
                this._isRejected = true;

                reject(reason);
            };

            executor(_resolve, _reject);
        });

        this._isPending = true;
        this._isFulfilled = false;
        this._isRejected = false;
    }

    public get isPending(): boolean { return this._isPending; }
    public get isFulfilled(): boolean { return this._isFulfilled; }
    public get isRejected(): boolean { return this._isRejected; }

    public get [Symbol.toStringTag]() { return "SmartPromise"; }
}
