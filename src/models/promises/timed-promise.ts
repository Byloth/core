import type { MaybePromise, PromiseExecutor } from "../../types.js";
import { TimeoutException } from "../exceptions/index.js";

export default class TimedPromise<T = void> extends Promise<T>
{
    protected _isPending: boolean;
    protected _isFulfilled: boolean;
    protected _isRejected: boolean;

    public constructor(executor: PromiseExecutor<T>, timeout?: number)
    {
        super((resolve, reject) =>
        {
            const _resolve = (result: MaybePromise<T>) =>
            {
                this._isPending = false;
                this._isFulfilled = true;

                clearTimeout(_timeoutId);
                resolve(result);
            };
            const _reject = (reason: unknown) =>
            {
                this._isPending = false;
                this._isRejected = true;

                clearTimeout(_timeoutId);
                reject(reason);
            };

            const _timeoutId = setTimeout(() =>
            {
                _reject(new TimeoutException("The operation has timed out."));

            }, timeout);

            executor(_resolve, _reject);
        });

        this._isPending = true;
        this._isFulfilled = false;
        this._isRejected = false;
    }

    public get isPending(): boolean { return this._isPending; }
    public get isFulfilled(): boolean { return this._isFulfilled; }
    public get isRejected(): boolean { return this._isRejected; }

    public get [Symbol.toStringTag]() { return "TimedPromise"; }
}
