import { KeyException, NotImplementedException, RuntimeException } from "../exceptions/index.js";

import CallableObject from "./callable-object.js";
import type { Callback } from "./types.js";

/**
 * A class representing a callback that can be switched between multiple implementations.
 *
 * It can be used to implement different behaviors for the same event handler, allowing
 * it to respond to different states without incurring any overhead during execution.
 *
 * ```ts
 * const onPointerMove = new SwitchableCallback<(evt: PointerEvent) => void>();
 *
 * onPointerMove.register("released", () => { [...] });
 * onPointerMove.register("pressed", () => { [...] });
 *
 * window.addEventListener("pointerdown", () => { onPointerMove.switch("pressed"); });
 * window.addEventListener("pointermove", onPointerMove);
 * window.addEventListener("pointerup", () => { onPointerMove.switch("released"); });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class SwitchableCallback<T extends Callback<any[], any> = Callback> extends CallableObject<T>
{
    protected _callback: T;
    protected _callbacks: Map<string, T>;

    protected _isEnabled: boolean;
    public get isEnabled(): boolean { return this._isEnabled; }

    protected _key: string;
    public get key(): string { return this._key; }

    protected readonly _invoke: (...args: Parameters<T>) => ReturnType<T>;

    /**
     * Initializes a new instance of the {@link SwitchableCallback} class.
     *
     * ```ts
     * const onPointerMove = new SwitchableCallback<(evt: PointerEvent) => void>();
     * ```
     */
    public constructor()
    {
        const _default = () =>
        {
            throw new NotImplementedException(
                "The `SwitchableCallback` has no callback defined yet. " +
                "Did you forget to call the `register` method?"
            );
        };

        super();

        this._callback = ((_default) as unknown) as T;
        this._callbacks = new Map<string, T>();

        this._isEnabled = true;
        this._key = "";

        this._invoke = (...args: Parameters<T>): ReturnType<T> => this._callback(...args);
    }

    /**
     * Enables the callback, allowing it to execute the currently selected implementation.
     *
     * Also note that:
     * - If any implementation has been registered yet, a {@link KeyException} will be thrown.  
     * - If the callback is already enabled, a {@link RuntimeException} will be thrown.
     *
     * ```ts
     * window.addEventListener("pointerdown", () => { onPointerMove.enable(); });
     * window.addEventListener("pointermove", onPointerMove);
     * ```
     */
    public enable(): void
    {
        if (!(this._key))
        {
            throw new KeyException(
                "The `SwitchableCallback` has no callback defined yet. " +
                "Did you forget to call the `register` method?"
            );
        }
        if (this._isEnabled)
        {
            throw new RuntimeException("The `SwitchableCallback` is already enabled.");
        }

        this._callback = this._callbacks.get(this._key)!;
        this._isEnabled = true;
    }

    /**
     * Disables the callback, allowing it to be invoked without executing any implementation.
     *
     * If the callback is already disabled, a {@link RuntimeException} will be thrown.
     *
     * ```ts
     * window.addEventListener("pointermove", onPointerMove);
     * window.addEventListener("pointerup", () => { onPointerMove.disable(); });
     * ```
     */
    public disable(): void
    {
        if (!(this._isEnabled))
        {
            throw new RuntimeException("The `SwitchableCallback` is already disabled.");
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this._callback = (() => { }) as T;
        this._isEnabled = false;
    }

    /**
     * Registers a new implementation for the callback.
     *
     * Also note that:
     * - If the callback has no other implementation registered yet, this one will be selected as default.
     * - If the key has already been used for another implementation, a {@link KeyException} will be thrown.
     *
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
     * ```ts
     * window.addEventListener("pointerdown", () => { onPointerMove.switch("pressed"); });
     * window.addEventListener("pointermove", onPointerMove);
     * window.addEventListener("pointerup", () => { onPointerMove.switch("released"); });
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

        this._key = key;

        if (this._isEnabled)
        {
            this._callback = this._callbacks.get(key)!;
        }
    }

    public override readonly [Symbol.toStringTag]: string = "SwitchableCallback";
}
