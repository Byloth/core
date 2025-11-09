import CallableObject from "./callable-object.js";
import type { Callback } from "./types.js";

/**
 * A class that collects multiple functions or callbacks and executes them sequentially when invoked.
 *
 * This is particularly useful for managing multiple cleanup operations, such as
 * collecting unsubscribe callbacks from event subscriptions and calling them all at once.
 *
 * ---
 *
 * @example
 * ```ts
 * const unsubscribeAll = new CallbackChain<() => void>()
 *     .add(() => console.log("Doing something..."))
 *     .add(() => console.log("Doing something else..."))
 *     .add(() => console.log("Doing yet another thing..."));
 *
 * unsubscribeAll();  // Doing something...
 *                    // Doing something else...
 *                    // Doing yet another thing...
 * ```
 *
 * ---
 *
 * @template T
 * The type signature of the functions in the chain.  
 * All functions must share the same signature. Default is `() => void`.
 */
export default class CallbackChain<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Callback<any[], any> = Callback,
    P extends Parameters<T> = Parameters<T>,
    R extends ReturnType<T> = ReturnType<T>
> extends CallableObject<Callback<P, R[]>>
{
    /**
     * The array containing all the functions in the chain.
     */
    protected readonly _callbacks: T[];

    /**
     * Gets the number of functions currently in the chain.
     */
    public get size(): number
    {
        return this._callbacks.length;
    }

    /**
     * Initializes a new instance of the {@link CallbackChain} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const chain = new CallbackChain();
     * ```
     *
     * ---
     *
     * @param callback Optional initial functions to add to the chain.
     */
    public constructor(...callback: T[])
    {
        super();

        this._callbacks = callback;
    }

    /**
     * Executes all functions in the chain sequentially with the provided arguments.
     *
     * ---
     *
     * @param args The arguments to pass to each function in the chain.
     *
     * @returns An array containing the return values of all functions.
     */
    protected override _invoke(...args: Parameters<T>): ReturnType<T>[]
    {
        return this._callbacks.map((callback) => callback(...args)) as ReturnType<T>[];
    }

    /**
     * Adds a function to the chain.
     *
     * ---
     *
     * @example
     * ```ts
     * const chain = new CallbackChain();
     * const cleanup = () => console.log("Cleaning up..."));
     *
     * chain.add(cleanup);
     * ```
     *
     * ---
     *
     * @param callback The function to add to the chain.
     *
     * @returns The current instance for method chaining.
     */
    public add(callback: T): this
    {
        this._callbacks.push(callback);

        return this;
    }

    /**
     * Removes a specific function from the chain.
     *
     * ---
     *
     * @example
     * ```ts
     * const chain = new CallbackChain();
     * const cleanup = () => console.log("Cleaning up..."));
     *
     * chain.add(cleanup);
     * chain.remove(cleanup);
     * ```
     *
     * ---
     *
     * @param callback The function to remove from the chain.
     *
     * @returns `true` if the function was found and removed, `false` otherwise.
     */
    public remove(callback: T): boolean
    {
        const index = this._callbacks.indexOf(callback);
        if (index < 0) { return false; }

        this._callbacks.splice(index, 1);

        return true;
    }

    /**
     * Removes all functions from the chain.
     *
     * ---
     *
     * @example
     * ```ts
     * const chain = new CallbackChain();
     *
     * chain.add(() => console.log("Doing something..."));
     * chain.add(() => console.log("Doing something else..."));
     * chain.add(() => console.log("Doing yet another thing..."));
     *
     * chain.clear();
     * ```
     */
    public clear(): void
    {
        this._callbacks.length = 0;
    }

    public override readonly [Symbol.toStringTag]: string = "CallbackChain";
}
