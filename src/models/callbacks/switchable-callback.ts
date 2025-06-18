import { KeyException, NotImplementedException, RuntimeException } from "../exceptions/index.js";

import CallableObject from "./callable-object.js";
import type { Callback } from "./types.js";

const Disabler = () => { /* ... */ };

/**
 * A class representing a callback that can be switched between multiple implementations.
 *
 * It can be used to implement different behaviors for the same event handler, allowing
 * it to respond to different states without incurring any overhead during execution.
 *
 * ---
 *
 * @example
 * ```ts
 * const onPointerMove = new SwitchableCallback<(evt: PointerEvent) => void>();
 *
 * onPointerMove.register("released", () => { [...] });
 * onPointerMove.register("pressed", () => { [...] });
 *
 * window.addEventListener("pointerdown", () => onPointerMove.switch("pressed"));
 * window.addEventListener("pointermove", onPointerMove);
 * window.addEventListener("pointerup", () => onPointerMove.switch("released"));
 * ```
 *
 * ---
 *
 * @template T The type signature of the callback. Default is `(...args: any[]) => any`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class SwitchableCallback<T extends Callback<any[], any> = Callback> extends CallableObject<T>
{
    /**
     * The currently selected implementation of the callback.
     */
    protected _callback: T;

    /**
     * All the implementations that have been registered for the callback.
     *
     * The keys are the names of the implementations they were registered with.  
     * The values are the implementations themselves.
     */
    protected readonly _callbacks: Map<string, T>;

    /**
     * A flag indicating whether the callback is enabled or not.
     *
     * This protected property is the only one that can be modified directly by the derived classes.  
     * If you're looking for the public and readonly property, use
     * the {@link SwitchableCallback.isEnabled} getter instead.
     */
    protected _isEnabled: boolean;

    /**
     * A flag indicating whether the callback is enabled or not.
     *
     * It indicates whether the callback is currently able to execute the currently selected implementation.  
     * If it's disabled, the callback will be invoked without executing anything.
     */
    public get isEnabled(): boolean { return this._isEnabled; }

    /**
     * The key that is associated with the currently selected implementation.
     *
     * This protected property is the only one that can be modified directly by the derived classes.  
     * If you're looking for the public and readonly property, use the {@link SwitchableCallback.key} getter instead.
     */
    protected _key: string;

    /**
     * The key that is associated with the currently selected implementation.
     */
    public get key(): string { return this._key; }

    /**
     * The function that will be called by the extended class when the object is invoked as a function.
     */
    protected readonly _invoke: (...args: Parameters<T>) => ReturnType<T>;

    /**
     * Initializes a new instance of the {@link SwitchableCallback} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const onPointerMove = new SwitchableCallback<(evt: PointerEvent) => void>();
     * ```
     */
    public constructor();

    /**
     * Initializes a new instance of the {@link SwitchableCallback}
     * class with the specified callback enabled by default.
     *
     * ---
     *
     * @example
     * ```ts
     * const onPointerMove = new SwitchableCallback<(evt: PointerEvent) => void>((evt) => { [...] });
     * ```
     *
     * ---
     *
     * @param callback The callback that will be executed when the object is invoked as a function by default.
     * @param key The key that is associated by default to the given callback. Default is `default`.
     */
    public constructor(callback: T, key?: string);
    public constructor(callback?: T, key = "default")
    {
        super();

        this._callbacks = new Map<string, T>();
        this._isEnabled = true;

        if (callback)
        {
            this._callbacks.set(key, callback);
        }
        else
        {
            key = "";

            callback = ((() =>
            {
                throw new NotImplementedException(
                    "The `SwitchableCallback` has no callback defined yet. " +
                    "Did you forget to call the `register` method?"
                );

            }) as unknown) as T;
        }

        this._key = key;

        this._callback = callback;
        this._invoke = (...args: Parameters<T>): ReturnType<T> => this._callback(...args);
    }

    /**
     * Enables the callback, allowing it to execute the currently selected implementation.
     *
     * Also note that:
     * - If any implementation has been registered yet, a {@link KeyException} will be thrown.  
     * - If any key is given and it doesn't have any associated
     * implementation yet, a {@link KeyException} will be thrown.
     * - If the callback is already enabled, a {@link RuntimeException} will be thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * window.addEventListener("pointerdown", () => onPointerMove.enable());
     * window.addEventListener("pointermove", onPointerMove);
     * ```
     *
     * ---
     *
     * @param key
     * The key that is associated with the implementation to enable. Default is the currently selected implementation.
     */
    public enable(key?: string): void
    {
        if (key === undefined)
        {
            if (!(this._key))
            {
                throw new KeyException(
                    "The `SwitchableCallback` has no callback defined yet. " +
                    "Did you forget to call the `register` method?"
                );
            }

            key = this._key;
        }
        else if (!(key))
        {
            throw new KeyException("The key must be a non-empty string.");
        }
        else if (!(this._callbacks.has(key)))
        {
            throw new KeyException(`The key '${key}' doesn't yet have any associated callback.`);
        }

        if (this._isEnabled)
        {
            throw new RuntimeException("The `SwitchableCallback` is already enabled.");
        }

        this._callback = this._callbacks.get(key)!;
        this._isEnabled = true;
    }

    /**
     * Disables the callback, allowing it to be invoked without executing any implementation.
     *
     * If the callback is already disabled, a {@link RuntimeException} will be thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * window.addEventListener("pointermove", onPointerMove);
     * window.addEventListener("pointerup", () => onPointerMove.disable());
     * ```
     */
    public disable(): void
    {
        if (!(this._isEnabled))
        {
            throw new RuntimeException("The `SwitchableCallback` is already disabled.");
        }

        this._callback = Disabler as T;
        this._isEnabled = false;
    }

    /**
     * Registers a new implementation for the callback.
     *
     * Also note that:
     * - If the callback has no other implementation registered yet, this one will be selected as default.
     * - If the key has already been used for another implementation, a {@link KeyException} will be thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * onPointerMove.register("pressed", () => { [...] });
     * onPointerMove.register("released", () => { [...] });
     * ```
     *
     * ---
     *
     * @param key The key that will be associated with the implementation.
     * @param callback The implementation to register.
     */
    public register(key: string, callback: T): void
    {
        if (this._callbacks.size === 0)
        {
            this._key = key;
            this._callback = callback;
        }
        else if (this._callbacks.has(key))
        {
            throw new KeyException(`The key '${key}' has already been used for another callback.`);
        }

        this._callbacks.set(key, callback);
    }

    /**
     * Unregisters an implementation for the callback.
     *
     * Also note that:
     * - If the key is the currently selected implementation, a {@link KeyException} will be thrown.
     * - If the key has no associated implementation yet, a {@link KeyException} will be thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * onPointerMove.unregister("released");
     * ```
     *
     * ---
     *
     * @param key The key that is associated with the implementation to unregister.
     */
    public unregister(key: string): void
    {
        if (this._key === key)
        {
            throw new KeyException("Unable to unregister the currently selected callback.");
        }
        if (!(this._callbacks.has(key)))
        {
            throw new KeyException(`The key '${key}' doesn't yet have any associated callback.`);
        }

        this._callbacks.delete(key);
    }

    /**
     * Switches the callback to the implementation associated with the given key.
     *
     * If the key has no associated implementation yet, a {@link KeyException} will be thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * window.addEventListener("pointerdown", () => onPointerMove.switch("pressed"));
     * window.addEventListener("pointermove", onPointerMove);
     * window.addEventListener("pointerup", () => onPointerMove.switch("released"));
     * ```
     *
     * ---
     *
     * @param key The key that is associated with the implementation to switch to.
     */
    public switch(key: string): void
    {
        if (!(this._callbacks.has(key)))
        {
            throw new KeyException(`The key '${key}' doesn't yet have any associated callback.`);
        }

        if (this._key === key) { return; }
        this._key = key;

        if (this._isEnabled)
        {
            this._callback = this._callbacks.get(key)!;
        }
    }

    public override readonly [Symbol.toStringTag]: string = "SwitchableCallback";
}
