import type { FulfilledHandler, PromiseExecutor, RejectedHandler } from "./types.js";

/**
 * A wrapper class representing an enhanced version of the native {@link Promise} object.
 *
 * It provides additional properties to check the state of the promise itself.  
 * The state can be either `pending`, `fulfilled` or `rejected` and is accessible through
 * the {@link SmartPromise.isPending}, {@link SmartPromise.isFulfilled} & {@link SmartPromise.isRejected} properties.
 *
 * ```ts
 * const promise = new SmartPromise<string>((resolve, reject) =>
 * {
 *     setTimeout(() => resolve("Hello, World!"), 1_000);
 * });
 *
 * console.log(promise.isPending); // true
 * console.log(promise.isFulfilled); // false
 *
 * console.log(await promise); // "Hello, World!"
 *
 * console.log(promise.isPending); // false
 * console.log(promise.isFulfilled); // true
 * ```
 *
 * ---
 *
 * @template T The type of value the promise will eventually resolve to. Default is `void`.
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
     * If you're looking for the public and readonly property, use the {@link SmartPromise.isPending} getter instead.
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
     * If you're looking for the public and readonly property, use the {@link SmartPromise.isFulfilled} getter instead.
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
     * If you're looking for the public and readonly property, use the {@link SmartPromise.isRejected} getter instead.
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
     * The native {@link Promise} object wrapped by this instance.
     */
    protected _promise: Promise<T>;

    /**
     * Initializes a new instance of the {@link SmartPromise} class.
     *
     * ```ts
     * const promise = new SmartPromise<string>((resolve, reject) =>
     * {
     *     setTimeout(() => resolve("Hello, World!"), 1_000);
     * });
     * ```
     *
     * ---
     *
     * @param executor
     * The function responsible for eventually resolving or rejecting the promise.  
     * Similarly to the native {@link Promise} object, it's immediately executed after the promise is created.
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
     * Creates a new {@link Promise} identical to the one wrapped by this instance, with a different reference.
     *
     * ```ts
     * const promise = new SmartPromise<string>((resolve, reject) =>
     * {
     *     setTimeout(() => resolve("Hello, World!"), 1_000);
     * });
     *
     * console.log(await promise.then()); // "Hello, World!"
     * ```
     *
     * ---
     *
     * @returns A new {@link Promise} identical to the original one.
     */
    public then(onFulfilled?: null): Promise<T>;

    /**
     * Attaches a callback that executes right after the promise is fulfilled.
     *
     * The previous result of the promise is passed as the argument to the callback.  
     * The callback's return value is considered the new promise's result instead.
     *
     * ```ts
     * const promise = new SmartPromise<string>((resolve, reject) =>
     * {
     *     setTimeout(() => resolve("Hello, World!"), 1_000);
     * });
     *
     * promise.then((result) => console.log(result)); // "Hello, World!"
     * ```
     *
     * ---
     *
     * @template F The type of value the new promise will eventually resolve to. Default is `T`.
     *
     * @param onFulfilled The callback to execute once the promise is fulfilled.
     *
     * @returns A new {@link Promise} resolved with the return value of the callback.
     */
    public then<F = T>(onFulfilled: FulfilledHandler<T, F>, onRejected?: null): Promise<F>;

    /**
     * Attaches callbacks that executes right after the promise is fulfilled or rejected.
     *
     * The previous result of the promise is passed as the argument to the fulfillment callback.  
     * The fulfillment callback's return value is considered the new promise's result instead.
     *
     * If an error is thrown during execution, the rejection callback is then executed instead.
     *
     * Also note that:
     * - If the rejection callback runs properly, the error is considered handled.  
     * The rejection callback's return value is considered the new promise's result.
     * - If the rejection callback throws an error, the new promise is rejected with that error.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(resolve, Math.random() * 1_000);
     *     setTimeout(reject, Math.random() * 1_000);
     * });
     *
     * promise.then(() => console.log("OK!"), () => console.log("KO!")); // "OK!" or "KO!"
     * ```
     *
     * ---
     *
     * @template F The type of value the new promise will eventually resolve to. Default is `T`.
     * @template R The type of value the new promise will eventually resolve to. Default is `never`.
     *
     * @param onFulfilled The callback to execute once the promise is fulfilled.
     * @param onRejected The callback to execute once the promise is rejected.
     *
     * @returns A new {@link Promise} resolved or rejected based on the callbacks.
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
     * Creates a new {@link Promise} identical to the one wrapped by this instance, with a different reference.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(() => reject(new Error("An unknown error occurred.")), 1_000);
     * });
     *
     * promise.catch(); // Uncaught Error: An unknown error occurred.
     * ```
     *
     * ---
     *
     * @returns A new {@link Promise} identical to the original one.
     */
    public catch(onRejected?: null): Promise<T>;

    /**
     * Attaches a callback to handle the potential rejection of the promise.  
     * If it happens, the callback is then executed.
     *
     * Also note that:
     * - If the callback runs properly, the error is considered handled.  
     * The callback's return value is considered the new promise's result.
     * - If the callback throws an error, the new promise is rejected with that error.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(() => reject(new Error("An unknown error occurred.")), 1_000);
     * });
     *
     * promise.catch((reason) => console.error(reason)); // "Error: An unknown error occurred."
     * ```
     *
     * ---
     *
     * @template R The type of value the new promise will eventually resolve to. Default is `T`.
     *
     * @param onRejected The callback to execute once the promise is rejected.
     *
     * @returns A new {@link Promise} able to catch and handle the potential error.
     */
    public catch<R = never>(onRejected: RejectedHandler<unknown, R>): Promise<T | R>;
    public catch<R = never>(onRejected?: RejectedHandler<unknown, R> | null): Promise<T | R>
    {
        return this._promise.catch(onRejected);
    }

    /**
     * Attaches a callback that executes right after the promise is settled, regardless of the outcome.
     *
     * ```ts
     * const promise = new SmartPromise((resolve, reject) =>
     * {
     *     setTimeout(resolve, Math.random() * 1_000);
     *     setTimeout(reject, Math.random() * 1_000);
     * });
     *
     * 
     * promise
     *     .then(() => console.log("OK!")) // Logs "OK!" if the promise is fulfilled.
     *     .catch(() => console.log("KO!")) // Logs "KO!" if the promise is rejected.
     *     .finally(() => console.log("Done!")); // Always logs "Done!".
     * ```
     *
     * ---
     *
     * @param onFinally The callback to execute when once promise is settled.
     *
     * @returns A new {@link Promise} that executes the callback once the promise is settled.
     */
    public finally(onFinally?: (() => void) | null): Promise<T>
    {
        return this._promise.finally(onFinally);
    }

    public readonly [Symbol.toStringTag]: string = "SmartPromise";
}
