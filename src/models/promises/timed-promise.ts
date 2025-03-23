import { TimeoutException } from "../exceptions/index.js";

import SmartPromise from "./smart-promise.js";
import type { MaybePromise, PromiseExecutor } from "./types.js";

/**
 * A class representing a {@link SmartPromise} that rejects automatically after a given time.  
 * It's useful for operations that must be completed within a certain time frame.
 *
 * If the operation takes longer than the specified time, the promise is rejected with a {@link TimeoutException}.
 *
 * ---
 *
 * @example
 * ```ts
 * const promise = new TimedPromise<string>((resolve, reject) =>
 * {
 *     setTimeout(() => resolve("Hello, World!"), Math.random() * 10_000);
 *
 * }, 5_000);
 *
 * promise
 *     .then((result) => console.log(result))  // "Hello, World!"
 *     .catch((error) => console.error(error)); // TimeoutException: The operation has timed out.
 * ```
 *
 * ---
 *
 * @template T The type of value the promise will eventually resolve to. Default is `void`.
 */
export default class TimedPromise<T = void> extends SmartPromise<T>
{
    /**
     * Initializes a new instance of the {@link TimedPromise} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const promise = new TimedPromise<string>((resolve, reject) =>
     * {
     *    setTimeout(() => resolve("Hello, World!"), Math.random() * 10_000);
     *
     * }, 5_000);
     * ```
     *
     * ---
     *
     * @param executor
     * The function responsible for eventually resolving or rejecting the promise.  
     * Similarly to the native {@link Promise} object, it's immediately executed after the promise is created.
     *
     * @param timeout The maximum time in milliseconds that the operation can take before timing out.
     */
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

    public override readonly [Symbol.toStringTag]: string = "TimedPromise";
}
