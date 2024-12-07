import { KeyException, NotImplementedException, RuntimeException } from "../exceptions/index.js";

import CallableObject from "./callable-object.js";
import type { Callback } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class SwitchableCallback<T extends Callback<any[], any> = Callback> extends CallableObject<T>
{
    protected _callback: T;
    protected _callbacks: Map<string, T>;

    protected _isEnabled: boolean;
    public get isEnabled(): boolean { return this._isEnabled; }

    protected _key: string;
    public get key(): string { return this._key; }

    public readonly invoke: (...args: Parameters<T>) => ReturnType<T>;

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

        this.invoke = (...args: Parameters<T>): ReturnType<T> => this._callback(...args);
    }

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
    public unregister(key: string): void
    {
        if (!(this._callbacks.has(key)))
        {
            throw new KeyException(`The key '${key}' doesn't yet have any associated callback.`);
        }

        this._callbacks.delete(key);
    }

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

    public readonly [Symbol.toStringTag]: string = "SwitchableCallback";
}
