/**
 * An utility type that represents a value that can be either a value or a promise of that value.  
 * This is useful when you want to handle both synchronous and asynchronous values in the same way.
 *
 * ```ts
 * async function splitWords(value: MaybePromise<string>): Promise<string[]>
 * {
 *     return (await value).split(" ");
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the value.
 */
export type MaybePromise<T> = T | PromiseLike<T>;

/**
 * An utility type that represents the callback that is executed when a promise is fulfilled.  
 * It's compatible with the `onFulfilled` parameter of the `then` method of the native {@link Promise} object.
 *
 * ```ts
 * const onFulfilled: FulfilledHandler<string, string[]> = (value) => value.split(" ");
 *
 * await new Promise<string>((resolve) => resolve("Hello, World!"))
 *     .then(onFulfilled);
 * ```
 *
 * ---
 *
 * @template T The type of value accepted by the function. Default is `void`.
 * @template R The type of value returned by the function. Default is `T`.
 */
export type FulfilledHandler<T = void, R = T> = (value: T) => MaybePromise<R>;

/**
 * An utility type that represents the callback that is executed when a promise is rejected.  
 * It's compatible with the `onRejected` parameter of the `then`/`catch` methods of the native {@link Promise} object.
 *
 * ```ts
 * const onRejected: RejectedHandler<unknown, string> = (reason) => String(reason);
 *
 * await new Promise<string>((_, reject) => reject(new Error("An error occurred.")))
 *     .catch(onRejected);
 * ```
 *
 * ---
 *
 * @template E The type of value accepted by the function. Default is `unknown`.
 * @template R The type of value returned by the function. Default is `never`.
 */
export type RejectedHandler<E = unknown, R = never> = (reason: E) => MaybePromise<R>;

/**
 * An utility type that represents a function that can be used to resolve a promise.  
 * It's compatible with the `resolve` parameter of the native {@link Promise} executor.
 *
 * ```ts
 * let _resolve: PromiseResolver<string> = (result) => console.log(result);
 *
 * await new Promise<string>((resolve) => { _resolve = resolve; });
 * ```
 *
 * ---
 *
 * @template T The type of the value accepted by the function. Default is `void`.
 */
export type PromiseResolver<T = void> = (result: MaybePromise<T>) => void;

/**
 * An utility type that represents a function that can be used to reject a promise.  
 * It's compatible with the `reject` parameter of the native {@link Promise} executor.
 *
 * ```ts
 * let _reject: PromiseRejecter<string> = (reason) => console.error(reason);
 *
 * await new Promise<string>((_, reject) => { _reject = reject; });
 * ```
 *
 * ---
 *
 * @template E The type of the value accepted by the function. Default is `unknown`.
 */
export type PromiseRejecter<E = unknown> = (reason?: MaybePromise<E>) => void;

/**
 * An utility type that represents the function that will be executed by the promise.  
 * It's compatible with the `executor` parameter of the native {@link Promise} object.
 *
 * ```ts
 * const executor: PromiseExecutor<string> = (resolve, reject) =>
 * {
 *     setTimeout(() => resolve("Hello, World!"), 1_000);
 * };
 *
 * await new Promise<string>(executor);
 * ```
 *
 * ---
 *
 * @template T The type of value accepted by the `resolve` function. Default is `void`.
 * @template E The type of value accepted by the `reject` function. Default is `unknown`.
 */
export type PromiseExecutor<T = void, E = unknown> = (resolve: PromiseResolver<T>, reject: PromiseRejecter<E>) => void;
