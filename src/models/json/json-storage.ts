import { isBrowser } from "../../helpers.js";
import { EnvironmentException } from "../exceptions/index.js";

import type { JSONValue } from "./types.js";

/**
 * A wrapper around the {@link Storage} API to better store and easily retrieve
 * typed JSON values using the classical key-value pair storage system.
 *
 * It allows to handle either the volatile {@link sessionStorage} or the persistent
 * {@link localStorage} at the same time, depending on what's your required use case.
 *
 * ---
 *
 * @example
 * ```ts
 * const jsonStorage = new JSONStorage();
 *
 * jsonStorage.write("user:cookieAck", { value: true, version: "2023-02-15" });
 * // ... between sessions ...
 * const cookieAck = jsonStorage.read<{ value: boolean; version: string; }>("user:cookieAck");
 * ```
 */
export default class JSONStorage
{
    /**
     * Whether to prefer the {@link localStorage} over the {@link sessionStorage} when calling an ambivalent method.
     *
     * If `true`, the persistent storage is preferred. If `false`, the volatile storage is preferred.  
     * Default is `true`.
     */
    protected _preferPersistence: boolean;

    /**
     * A reference to the volatile {@link sessionStorage} storage.
     */
    protected _volatile: Storage;

    /**
     * A reference to the persistent {@link localStorage} storage.
     */
    protected _persistent: Storage;

    /**
     * Initializes a new instance of the {@link JSONStorage} class.  
     * It cannot be instantiated outside of a browser environment or an {@link EnvironmentException} is thrown.
     *
     * ---
     *
     * @example
     * ```ts
     * const jsonStorage = new JSONStorage();
     * ```
     *
     * ---
     *
     * @param preferPersistence
     * Whether to prefer the {@link localStorage} over the {@link sessionStorage} when calling an ambivalent method.  
     * If omitted, it defaults to `true` to prefer the persistent storage.
     */
    public constructor(preferPersistence = true)
    {
        if (!(isBrowser))
        {
            throw new EnvironmentException(
                "The `JSONStorage` class can only be instantiated within a browser environment."
            );
        }

        this._preferPersistence = preferPersistence;

        this._volatile = window.sessionStorage;
        this._persistent = window.localStorage;
    }

    protected _get<T extends JSONValue>(storage: Storage, key: string): T | undefined;
    protected _get<T extends JSONValue>(storage: Storage, key: string, defaultValue: T): T;
    protected _get<T extends JSONValue>(storage: Storage, key: string, defaultValue?: T): T | undefined;
    protected _get<T extends JSONValue>(storage: Storage, key: string, defaultValue?: T): T | undefined
    {
        const value = storage.getItem(key);
        if (value)
        {
            try
            {
                return JSON.parse(value);
            }
            catch
            {
                // eslint-disable-next-line no-console
                console.warn(
                    `The "${value}" value for "${key}"` +
                    " property cannot be parsed. Clearing the storage...");

                storage.removeItem(key);
            }
        }

        return defaultValue;
    }
    protected _set<T extends JSONValue>(storage: Storage, key: string, newValue?: T): void
    {
        const encodedValue = JSON.stringify(newValue);
        if (encodedValue)
        {
            storage.setItem(key, encodedValue);
        }
        else
        {
            storage.removeItem(key);
        }
    }

    /**
     * Retrieves the value with the specified key from the default storage.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.get<TValue>("key");
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     *
     * @returns The value with the specified key or `undefined` if the key doesn't exist.
     */
    public get<T extends JSONValue>(key: string): T | undefined;

    /**
     * Retrieves the value with the specified key from the default storage.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.get<TValue>("key", defaultValue);
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the key doesn't exist.
     * @param persistent
     * Whether to prefer the persistent {@link localStorage} over the volatile {@link sessionStorage}.  
     * If omitted, it defaults to the `preferPersistence` value set in the constructor.
     *
     * @returns The value with the specified key or the provided default value if the key doesn't exist.
     */
    public get<T extends JSONValue>(key: string, defaultValue: T, persistent?: boolean): T;

    /**
     * Retrieves the value with the specified key from the default storage.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.get<TValue>("key", obj?.value);
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return (which may be `undefined`) if the key doesn't exist.
     * @param persistent
     * Whether to prefer the persistent {@link localStorage} over the volatile {@link sessionStorage}.  
     * If omitted, it defaults to the `preferPersistence` value set in the constructor.
     *
     * @returns The value with the specified key or the default value if the key doesn't exist.
     */
    public get<T extends JSONValue>(key: string, defaultValue?: T, persistent?: boolean): T | undefined;
    public get<T extends JSONValue>(key: string, defaultValue?: T, persistent = this._preferPersistence)
        : T | undefined
    {
        const storage = persistent ? this._persistent : this._volatile;

        return this._get<T>(storage, key, defaultValue);
    }

    /**
     * Retrieves the value with the specified key from the volatile {@link sessionStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.recall<TValue>("key");
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     *
     * @returns The value with the specified key or `undefined` if the key doesn't exist.
     */
    public recall<T extends JSONValue>(key: string): T | undefined;

    /**
     * Retrieves the value with the specified key from the volatile {@link sessionStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.recall<TValue>("key", defaultValue);
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the key doesn't exist.
     *
     * @returns The value with the specified key or the default value if the key doesn't exist.
     */
    public recall<T extends JSONValue>(key: string, defaultValue: T): T;

    /**
     * Retrieves the value with the specified key from the volatile {@link sessionStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.recall<TValue>("key", obj?.value);
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return (which may be `undefined`) if the key doesn't exist.
     *
     * @returns The value with the specified key or the default value if the key doesn't exist.
     */
    public recall<T extends JSONValue>(key: string, defaultValue?: T): T | undefined;
    public recall<T extends JSONValue>(key: string, defaultValue?: T): T | undefined
    {
        return this._get<T>(this._volatile, key, defaultValue);
    }

    /**
     * Retrieves the value with the specified key looking first in the volatile
     * {@link sessionStorage} and then, if not found, in the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.retrieve<TValue>("key");
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     *
     * @returns The value with the specified key or `undefined` if the key doesn't exist.
     */
    public retrieve<T extends JSONValue>(key: string): T | undefined;

    /**
     * Retrieves the value with the specified key looking first in the volatile
     * {@link sessionStorage} and then, if not found, in the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.retrieve<TValue>("key", defaultValue);
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the key doesn't exist.
     *
     * @returns The value with the specified key or the default value if the key doesn't exist.
     */
    public retrieve<T extends JSONValue>(key: string, defaultValue: T): T;

    /**
     * Retrieves the value with the specified key looking first in the volatile
     * {@link sessionStorage} and then, if not found, in the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.retrieve<TValue>("key", obj?.value);
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return (which may be `undefined`) if the key doesn't exist.
     *
     * @returns The value with the specified key or the default value if the key doesn't exist.
     */
    public retrieve<T extends JSONValue>(key: string, defaultValue?: T): T | undefined;
    public retrieve<T extends JSONValue>(key: string, defaultValue?: T): T | undefined
    {
        return this.recall<T>(key) ?? this.read<T>(key, defaultValue);
    }

    /**
     * Retrieves the value with the specified key from the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.read<TValue>("key");
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     *
     * @returns The value with the specified key or `undefined` if the key doesn't exist.
     */
    public read<T extends JSONValue>(key: string): T | undefined;

    /**
     * Retrieves the value with the specified key from the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.read<TValue>("key", defaultValue);
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the key doesn't exist.
     *
     * @returns The value with the specified key or the default value if the key doesn't exist.
     */
    public read<T extends JSONValue>(key: string, defaultValue: T): T;

    /**
     * Retrieves the value with the specified key from the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * const value: TValue = jsonStorage.read<TValue>("key", obj?.value);
     * ```
     *
     * ---
     *
     * @template T The type of the value to retrieve.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return (which may be `undefined`) if the key doesn't exist.
     *
     * @returns The value with the specified key or the default value if the key doesn't exist.
     */
    public read<T extends JSONValue>(key: string, defaultValue?: T): T | undefined;
    public read<T extends JSONValue>(key: string, defaultValue?: T): T | undefined
    {
        return this._get<T>(this._persistent, key, defaultValue);
    }

    /**
     * Checks whether the value with the specified key exists within the default storage.
     *
     * ---
     *
     * @example
     * ```ts
     * if (jsonStorage.has("key"))
     * {
     *    // The key exists. Do something...
     * }
     * ```
     *
     * ---
     *
     * @param key The key of the value to check.
     * @param persistent
     * Whether to prefer the persistent {@link localStorage} over the volatile {@link sessionStorage}.  
     * If omitted, it defaults to the `preferPersistence` value set in the constructor.
     *
     * @returns `true` if the key exists, `false` otherwise.
     */
    public has(key: string, persistent?: boolean): boolean
    {
        const storage = persistent ? this._persistent : this._volatile;

        return storage.getItem(key) !== null;
    }

    /**
     * Checks whether the value with the specified key exists within the volatile {@link sessionStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * if (jsonStorage.knows("key"))
     * {
     *    // The key exists. Do something...
     * }
     * ```
     *
     * ---
     *
     * @param key The key of the value to check.
     *
     * @returns `true` if the key exists, `false` otherwise.
     */
    public knows(key: string): boolean
    {
        return this._volatile.getItem(key) !== null;
    }

    /**
     * Checks whether the value with the specified key exists looking first in the
     * volatile {@link sessionStorage} and then, if not found, in the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * if (jsonStorage.find("key"))
     * {
     *    // The key exists. Do something...
     * }
     * ```
     *
     * ---
     *
     * @param key The key of the value to check.
     *
     * @returns `true` if the key exists, `false` otherwise.
     */
    public find(key: string): boolean
    {
        return this.knows(key) ?? this.exists(key);
    }

    /**
     * Checks whether the value with the specified key exists within the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * if (jsonStorage.exists("key"))
     * {
     *    // The key exists. Do something...
     * }
     * ```
     *
     * ---
     *
     * @param key The key of the value to check.
     *
     * @returns `true` if the key exists, `false` otherwise.
     */
    public exists(key: string): boolean
    {
        return this._persistent.getItem(key) !== null;
    }

    /**
     * Sets the value with the specified key in the default storage.  
     * If the value is `undefined` or omitted, the key is removed from the storage.
     *
     * ---
     *
     * @example
     * ```ts
     * jsonStorage.set("key");
     * jsonStorage.set("key", value);
     * jsonStorage.set("key", obj?.value);
     * ```
     *
     * ---
     *
     * @template T The type of the value to set.
     *
     * @param key The key of the value to set.
     * @param newValue The new value to set. If it's `undefined` or omitted, the key is removed instead.
     * @param persistent
     * Whether to prefer the persistent {@link localStorage} over the volatile {@link sessionStorage}.  
     * If omitted, it defaults to the `preferPersistence` value set in the constructor.
     */
    public set<T extends JSONValue>(key: string, newValue?: T, persistent = this._preferPersistence): void
    {
        const storage = persistent ? this._persistent : this._volatile;

        this._set<T>(storage, key, newValue);
    }

    /**
     * Sets the value with the specified key in the volatile {@link sessionStorage}.  
     * If the value is `undefined` or omitted, the key is removed from the storage.
     *
     * ---
     *
     * @example
     * ```ts
     * jsonStorage.remember("key");
     * jsonStorage.remember("key", value);
     * jsonStorage.remember("key", obj?.value);
     * ```
     *
     * ---
     *
     * @template T The type of the value to set.
     *
     * @param key The key of the value to set.
     * @param newValue The new value to set. If it's `undefined` or omitted, the key is removed instead.
     */
    public remember<T extends JSONValue>(key: string, newValue?: T): void
    {
        this._set<T>(this._volatile, key, newValue);
    }

    /**
     * Sets the value with the specified key in the persistent {@link localStorage}.  
     * If the value is `undefined` or omitted, the key is removed from the storage.
     *
     * ---
     *
     * @example
     * ```ts
     * jsonStorage.write("key");
     * jsonStorage.write("key", value);
     * jsonStorage.write("key", obj?.value);
     * ```
     *
     * ---
     *
     * @template T The type of the value to set.
     *
     * @param key The key of the value to set.
     * @param newValue The new value to set. If it's `undefined` or omitted, the key is removed instead.
     */
    public write<T extends JSONValue>(key: string, newValue?: T): void
    {
        this._set<T>(this._persistent, key, newValue);
    }

    /**
     * Removes the value with the specified key from the default storage.
     *
     * ---
     *
     * @example
     * ```ts
     * jsonStorage.delete("key");
     * ```
     *
     * ---
     *
     * @param key The key of the value to remove.
     * @param persistent
     * Whether to prefer the persistent {@link localStorage} over the volatile {@link sessionStorage}.  
     * If omitted, it defaults to the `preferPersistence` value set in the constructor.
     */
    public delete(key: string, persistent?: boolean): void
    {
        const storage = persistent ? this._persistent : this._volatile;

        storage.removeItem(key);
    }

    /**
     * Removes the value with the specified key from the volatile {@link sessionStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * jsonStorage.forget("key");
     * ```
     *
     * ---
     *
     * @param key The key of the value to remove.
     */
    public forget(key: string): void
    {
        this._volatile.removeItem(key);
    }

    /**
     * Removes the value with the specified key from the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * jsonStorage.erase("key");
     * ```
     *
     * ---
     *
     * @param key The key of the value to remove.
     */
    public erase(key: string): void
    {
        this._persistent.removeItem(key);
    }

    /**
     * Removes the value with the specified key from both the
     * volatile {@link sessionStorage} and the persistent {@link localStorage}.
     *
     * ---
     *
     * @example
     * ```ts
     * jsonStorage.clear("key");
     * ```
     *
     * ---
     *
     * @param key The key of the value to remove.
     */
    public clear(key: string): void
    {
        this._volatile.removeItem(key);
        this._persistent.removeItem(key);
    }

    public readonly [Symbol.toStringTag]: string = "JSONStorage";
}
