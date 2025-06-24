import type { Callback } from "../callbacks/types.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TimeoutException, ValueException } from "../exceptions/index.js";

import DeferredPromise from "./deferred-promise.js";
import SmartPromise from "./smart-promise.js";
import TimedPromise from "./timed-promise.js";
import type { MaybePromise, PromiseRejecter, PromiseResolver } from "./types.js";

/**
 * A class that represents a queue of asynchronous operations, allowing them to be executed sequentially.
 *
 * It extends the {@link SmartPromise} class, providing a way to manage multiple promises in a controlled manner.   
 * This class is useful for scenarios where you need to ensure
 * that only one asynchronous operation is executed at a time,
 * such as when dealing with API requests, file operations or any other
 * asynchronous tasks that need to be handled in a specific order.
 *
 * ---
 *
 * @example
 * ```ts
 * const queue = new PromiseQueue();
 *
 * queue.enqueue(() => new Promise((resolve) => setTimeout(() => resolve("First"), 2000)))
 * queue.enqueue(() => new Promise((resolve) => setTimeout(() => resolve("Second"), 500)))
 * queue.enqueue(() => new Promise((resolve) => setTimeout(() => resolve("Third"), 1000)))
 *
 * await queue; // "First", "Second", "Third"
 * ```
 */
export default class PromiseQueue extends SmartPromise<void>
{
    /**
     * The number of promises currently in the queue.
     */
    protected _count: number;

    /**
     * A flag indicating whether the promise is still pending or not.
     */
    public override get isPending(): boolean
    {
        return this._count > 0;
    }
    /**
     * A flag indicating whether the promise has been fulfilled or not.
     */
    public override get isFulfilled(): boolean
    {
        return this._count === 0;
    }

    /**
     * A flag indicating whether the promise has been rejected or not.
     *
     * Please note the {@link PromiseQueue} doesn't support rejection states.  
     * Accessing this property will always result in a {@link ValueException}.
     */
    public override get isRejected(): never
    {
        throw new ValueException("`PromiseQueue` doesn't support rejection states.");
    }

    /**
     * The native {@link Promise} object wrapped by this instance.
     */
    declare protected _promise: Promise<void>;

    /**
     * Initializes a new instance of the {@link PromiseQueue} class.
     */
    public constructor()
    {
        super((resolve) => resolve());

        this._count = 0;

        this._isPending = false;
        this._isFulfilled = false;
        this._isRejected = false;
    }

    /**
     * Enqueues a {@link DeferredPromise} into the queue.
     *
     * The promise will be executed in sequence after previously enqueued promises.
     *
     * ---
     *
     * @example
     * ```ts
     * const queue = new PromiseQueue();
     * const deferred = new DeferredPromise(() => console.log("Hello, world!"));
     * 
     * queue.enqueue(deferred); // "Hello, world!"
     * ```
     *
     * ---
     *
     * @template T The type of value the promise will eventually resolve to.
     *
     * @param promise A `DeferredPromise<void, T>` instance to enqueue.
     *
     * @returns A {@link SmartPromise} that resolves to the value of the enqueued promise.
     */
    public enqueue<T>(promise: DeferredPromise<void, T>): SmartPromise<T>;

    /**
     * Enqueues a {@link DeferredPromise} into the queue with an optional timeout.
     *
     * The promise will be executed in sequence after previously enqueued promises.  
     * If the promise takes longer than the specified timeout, it will be rejected with a {@link TimeoutException}.
     *
     * ---
     *
     * @example
     * ```ts
     * const queue = new PromiseQueue();
     * const deferred = new DeferredPromise(() => console.log("Hello, world!"));
     *
     * queue.enqueue(deferred, 5000); // "Hello, world!"
     * ```
     *
     * ---
     *
     * @template T The type of value the promise will eventually resolve to.
     *
     * @param promise A `DeferredPromise<void, T>` instance to enqueue.
     * @param timeout The maximum time in milliseconds that the operation can take before timing out.
     *
     * @returns
     * A {@link TimedPromise} that resolves to the value of the enqueued promise or rejects
     * with a `TimeoutException` if the operation takes longer than the specified timeout.
     */
    public enqueue<T>(promise: DeferredPromise<void, T>, timeout: number): TimedPromise<T>;

    /**
     * Enqueues a callback that returns a {@link MaybePromise} value of type `T` into the queue.
     *
     * The executor will be executed in sequence after previously enqueued promises.
     *
     * ---
     *
     * @example
     * ```ts
     * const queue = new PromiseQueue();
     *
     * queue.enqueue(() => console.log("Hello, world!")); // "Hello, world!"
     * ```
     *
     * ---
     *
     * @template T The type of value the promise will eventually resolve to.
     *
     * @param executor A callback that returns a `MaybePromise<T>` value to enqueue.
     *
     * @returns A {@link SmartPromise} that resolves to the value of the enqueued executor.
     */
    public enqueue<T>(executor: Callback<[], MaybePromise<T>>): SmartPromise<T>;

    /**
     * Enqueues a callback that returns a {@link MaybePromise}
     * value of type `T` into the queue with an optional timeout.
     *
     * The executor will be executed in sequence after previously enqueued promises.  
     * If the executor takes longer than the specified timeout, it will be rejected with a {@link TimeoutException}.
     *
     * ---
     *
     * @example
     * ```ts
     * const queue = new PromiseQueue();
     *
     * queue.enqueue(() => console.log("Hello, world!"), 5000); // "Hello, world!"
     * ```
     *
     * ---
     *
     * @template T The type of value the promise will eventually resolve to.
     *
     * @param executor A callback that returns a `MaybePromise<T>` value to enqueue.
     * @param timeout The maximum time in milliseconds that the operation can take before timing out.
     *
     * @returns
     * A {@link TimedPromise} that resolves to the value of the enqueued executor or rejects
     * with a `TimeoutException` if the operation takes longer than the specified timeout.
     */
    public enqueue<T>(executor: Callback<[], MaybePromise<T>>, timeout?: number): TimedPromise<T>;
    public enqueue<T>(executor: DeferredPromise<void, T> | Callback<[], MaybePromise<T>>, timeout?: number)
        : SmartPromise<T> | TimedPromise<T>
    {
        this._count += 1;

        if (executor instanceof DeferredPromise)
        {
            const _executor = executor as DeferredPromise<void, T>;

            executor = () =>
            {
                _executor.resolve();

                return _executor;
            };
        }

        const _executor = (resolve: PromiseResolver<T>, reject: PromiseRejecter) =>
        {
            this._promise = this._promise
                .then(executor)
                .then((value) => { this._count -= 1; resolve(value); })
                .catch((value) => { this._count -= 1; reject(value); });
        };

        if (timeout) { return new TimedPromise<T>(_executor, timeout); }

        return new SmartPromise<T>(_executor);
    }

    public override readonly [Symbol.toStringTag]: string = "PromiseQueue";
}
