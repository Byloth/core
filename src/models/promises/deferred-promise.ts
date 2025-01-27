import type { PromiseResolver, PromiseRejecter, FulfilledHandler, RejectedHandler } from "./types.js";

import SmartPromise from "./smart-promise.js";

/**
 * A class representing a {@link SmartPromise} that can be resolved or rejected from the "outside".  
 * The `resolve` and `reject` methods are exposed to allow the promise to be settled from another context.
 *
 * It's particularly useful in scenarios where the promise is created and needs to be awaited in one place,  
 * while being resolved or rejected in another (e.g. an event handler for an user interaction).
 *
 * This is a change in the approach to promises: instead of defining how the promise will be resolved (or rejected),  
 * you define how to handle the resolution (or rejection) when it occurs.
 *
 * ```ts
 * const promise = new DeferredPromise<string, string[]>((value: string) => value.split(" "));
 *
 * promise.then((result) => console.log(result)); // ["Hello,", "World!"]
 * promise.resolve("Hello, World!");
 * ```
 *
 * @template T The type of value the promise expects to initially be resolved with. Default is `void`.
 * @template F
 * The type of value returned by the `onFulfilled` callback.  
 * This will be the actual type of value the promise will eventually resolve to. Default is `T`.
 * @template R
 * The type of value possibly returned by the `onRejected` callback.  
 * This will be coupled with the type of value the promise will eventually resolve to, if provided. Default is `never`.
 */
export default class DeferredPromise<T = void, F = T, R = never> extends SmartPromise<F | R>
{
    /**
     * The exposed function that allows to resolve the promise.
     *
     * This protected property is the only one that can be modified directly by the derived classes.  
     * If you're looking for the public and readonly property, use the {@link DeferredPromise.resolve} getter instead.
     */
    protected _resolve: PromiseResolver<T>;

    /**
     * The exposed function that allows to reject the promise.
     */
    public get resolve(): PromiseResolver<T> { return this._resolve; }

    /**
     * The exposed function that allows to reject the promise.
     *
     * This protected property is the only one that can be modified directly by the derived classes.  
     * If you're looking for the public and readonly property, use the {@link DeferredPromise.reject} getter instead.
     */
    protected _reject: PromiseRejecter;

    /**
     * The exposed function that allows to reject the promise.
     */
    public get reject(): PromiseRejecter { return this._reject; }

    /**
     * Initializes a new instance of the {@link DeferredPromise} class.
     *
     * ```ts
     * const promise = new DeferredPromise<string, string[]>((value: string) => value.split(" "));
     * ```
     *
     * @param onFulfilled The callback to execute once the promise is fulfilled.
     * @param onRejected The callback to execute once the promise is rejected.
     */
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

        this._promise = this._promise.then(onFulfilled as FulfilledHandler<F | R>, onRejected);

        this._resolve = _resolve!;
        this._reject = _reject!;
    }

    /**
     * Watches another promise and resolves or rejects this promise when the other one is settled.
     *
     * ```ts
     * const promise = new Promise<string>((resolve) => setTimeout(() => resolve("Hello, World!"), 1_000));
     * const deferred = new DeferredPromise<string, string[]>((value: string) => value.split(" "));
     *
     * deferred.then((result) => console.log(result)); // ["Hello,", "World!"]
     * deferred.watch(promise);
     * ```
     *
     * @param otherPromise The promise to watch.
     *
     * @returns The current instance of the {@link DeferredPromise} class.
     */
    public watch(otherPromise: PromiseLike<T>): this
    {
        otherPromise.then(this.resolve, this.reject);

        return this;
    }

    public override readonly [Symbol.toStringTag]: string = "DeferredPromise";
}
