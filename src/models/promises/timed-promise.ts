import { TimeoutException } from "../exceptions/index.js";

import SmartPromise from "./smart-promise.js";
import type { MaybePromise, PromiseExecutor } from "./types.js";

export default class TimedPromise<T = void> extends SmartPromise<T>
{
    public constructor(executor: PromiseExecutor<T>, timeout?: number)
    {
        super((resolve, reject) =>
        {
            const _resolve = (result: MaybePromise<T>) =>
            {
                clearTimeout(_timeoutId);
                resolve(result);
            };
            const _reject = (reason: unknown) =>
            {
                clearTimeout(_timeoutId);
                reject(reason);
            };

            const _timeout = () => _reject(new TimeoutException("The operation has timed out."));
            const _timeoutId = setTimeout(_timeout, timeout);

            executor(_resolve, _reject);
        });
    }

    public readonly [Symbol.toStringTag]: string = "TimedPromise";
}
