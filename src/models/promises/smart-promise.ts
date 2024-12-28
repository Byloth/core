import type { FulfilledHandler, PromiseExecutor, RejectedHandler } from "./types.js";

/**
 * A wrapper class representing an enhanced version of the native {@link Promise} object.
 *
 * It provides additional properties that allow you to check the state of the promise itself.  
 * The state can be either `pending`, `fulfilled` or `rejected` and you can access it via the
 * {@link isPending}, {@link isFulfilled} and {@link isRejected} properties.
 *
 * ```ts
 * const promise = new SmartPromise((resolve, reject) =>
 * {
 *     setTimeout(() => resolve("Hello, World!"), 1000);
 * });
 *
 * console.log(promise.isPending); // true
 * console.log(await promise); // "Hello, World!"
 * console.log(promise.isFulfilled); // true
 * ```
 */
export default class SmartPromise<T = void> implements Promise<T>
{
    /**
     * Wraps a new {@link SmartPromise} object around an existing native {@link Promise} object.
     *
     * ```ts
     * const request = fetch("https://api.example.com/data");
     * const smartRequest = SmartPromise.FromPromise(request);
     *
     * console.log(request.isPending); // Throws an error: `isPending` is not a property of `Promise`.
     * console.log(smartRequest.isPending); // true
     *
     * const response = await request;
     * console.log(smartRequest.isFulfilled); // true
     * ```
     *
     * ---
     *
     * @param promise The promise to wrap.
     *
     * @returns A new {@link SmartPromise} object that wraps the provided promise.
     */
    public static FromPromise<T>(promise: Promise<T>): SmartPromise<T>
    {
        return new SmartPromise((resolve, reject) => promise.then(resolve, reject));
    }

    /**
     * A flag indicating whether the promise is still pending or not.
     *
     * The protected property is the only one that can be modified directly by the derived classes.
     * If you're looking for the public & readonly property, use the {@link isPending} getter instead.
     */
    protected _isPending: boolean;

    /**
     * A flag indicating whether the promise is still pending or not.
     */
    public get isPending(): boolean
    {
        return this._isPending;
    }

    /**
     * A flag indicating whether the promise has been fulfilled or not.
     *
     * The protected property is the only one that can be modified directly by the derived classes.
     * If you're looking for the public & readonly property, use the {@link isFulfilled} getter instead.
     */
    protected _isFulfilled: boolean;

    /**
     * A flag indicating whether the promise has been fulfilled or not.
     */
    public get isFulfilled(): boolean
    {
        return this._isFulfilled;
    }

    /**
     * A flag indicating whether the promise has been rejected or not.
     *
     * The protected property is the only one that can be modified directly by the derived classes.
     * If you're looking for the public & readonly property, use the {@link isRejected} getter instead.
     */
    protected _isRejected: boolean;

    /**
     * A flag indicating whether the promise has been rejected or not.
     */
    public get isRejected(): boolean
    {
        return this._isRejected;
    }

    /**
     * The native {@link Promise} object that is wrapped by this {@link SmartPromise} itself.
     */
    protected _promise: Promise<T>;

    /**
     * Initializes a new instance of the {@link SmartPromise} class.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(() => resolve("Hello, World!"), 1000);
     * });
     * ```
     *
     * ---
     *
     * @param executor
     * The function that is responsible for eventually resolving or rejecting the promise.  
     * Just ike for the native {@link Promise}, it will be immediately executed after the promise has been created.
     */
    public constructor(executor: PromiseExecutor<T>)
    {
        this._isPending = true;
        this._isFulfilled = false;
        this._isRejected = false;

        const _onFulfilled = (result: T): T =>
        {
            this._isPending = false;
            this._isFulfilled = true;

            return result;
        };
        const _onRejected = (reason: unknown): never =>
        {
            this._isPending = false;
            this._isRejected = true;

            throw reason;
        };

        this._promise = new Promise<T>(executor)
            .then(_onFulfilled, _onRejected);
    }

    /**
     * Creates a new {@link Promise} object identical to the one that is wrapped by this {@link SmartPromise}.  
     * Just with a different reference so you won't be able to compare or modify the original one.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(() => resolve("Hello, World!"), 1000);
     * });
     *
     * console.log(await promise.then()); // "Hello, World!"
     * ```
     *
     * ---
     *
     * @returns A new {@link Promise} object that's identical to the original one.
     */
    public then(onFulfilled?: null): Promise<T>;

    /**
     * Attaches a callback to the promise that will be called right after the promise has been fulfilled.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(() => resolve("Hello, World!"), 1000);
     * });
     *
     * promise.then((result) => console.log(result)); // "Hello, World!"
     * ```
     *
     * ---
     *
     * @param onFulfilled The callback that will be called when the promise has been fulfilled.
     *
     * @returns A new {@link Promise} object that will be resolved with the return value of the callback.
     */
    public then<F = T>(onFulfilled: FulfilledHandler<T, F>, onRejected?: null): Promise<F>;

    /**
     * Attaches callbacks to the promise that will be called right after the promise has been fulfilled or rejected.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(resolve, Math.random() * 1000);
     *     setTimeout(reject, Math.random() * 1000);
     * });
     *
     * promise.then(() => console.log("OK!"), () => console.log("KO!")); // "OK!" or "KO!"
     * ```
     *
     * ---
     *
     * @param onFulfilled The callback that will be called when the promise has been fulfilled.
     * @param onRejected The callback that will be called when the promise has been rejected.
     *
     * @returns A new {@link Promise} object that will be resolved with the return value of the callback.
     */
    public then<F = T, R = never>(onFulfilled: FulfilledHandler<T, F>, onRejected: RejectedHandler<unknown, R>)
        : Promise<F | R>;
    public then<F = T, R = never>(
        onFulfilled?: FulfilledHandler<T, F> | null,
        onRejected?: RejectedHandler<unknown, R> | null): Promise<F | R>
    {
        return this._promise.then(onFulfilled, onRejected);
    }

    /**
     * Creates a new {@link Promise} object identical to the one that is wrapped by this {@link SmartPromise}.  
     * Just with a different reference so you won't be able to compare or modify the original one.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(() => reject(new Error("An unknown error occurred.")), 1000);
     * });
     *
     * promise.catch(); // Uncaught Error: An unknown error occurred.
     * ```
     *
     * ---
     *
     * @returns A new {@link Promise} object that's identical to the original one.
     */
    public catch(onRejected?: null): Promise<T>;

    /**
     * Attaches a callback to the promise that will be called right after the promise has been rejected.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(() => reject(new Error("An unknown error occurred.")), 1000);
     * });
     *
     * promise.catch((reason) => console.error(reason)); // "Error: An unknown error occurred."
     * ```
     *
     * ---
     *
     * @param onRejected The callback that will be called when the promise has been rejected.
     *
     * @returns
     * A new {@link Promise} object that will catch the error and resolve with the return value of the callback.
     */
    public catch<R = never>(onRejected: RejectedHandler<unknown, R>): Promise<T | R>;
    public catch<R = never>(onRejected?: RejectedHandler<unknown, R> | null): Promise<T | R>
    {
        return this._promise.catch(onRejected);
    }

    /**
     * Attaches a callback to the promise that will be called right after the promise has been settled.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(resolve, Math.random() * 1000);
     *     setTimeout(reject, Math.random() * 1000);
     * });
     *
     * 
     * promise.then(() => console.log("OK!")) // First will only prints "OK!" is the promise is resolved.
     *     .catch(() => console.log("KO!")) // First will only prints "KO!" is the promise is rejected.
     *     .finally(() => console.log("Done!")); // Then will always prints "Done!" in any case.
     * ```
     *
     * ---
     *
     * @param onFinally The callback that will be called when the promise has been settled.
     *
     * @returns A new {@link Promise} object that will always execute the callback at the end.
     */
    public finally(onFinally?: (() => void) | null): Promise<T>
    {
        return this._promise.finally(onFinally);
    }

    public readonly [Symbol.toStringTag]: string = "SmartPromise";
}
