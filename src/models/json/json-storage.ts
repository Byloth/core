
import { isBrowser } from "../../helpers.js";
import { EnvironmentException } from "../exceptions/index.js";

import type { JSONValue } from "./types.js";

/**
 * A wrapper around the `Storage` API to better store and easily retrieve JSON values
 * using the classical key-value pair storage system.
 *
 * It allows to handle either the `sessionStorage` or the `localStorage`
 * storage at the same time, depending on what's your required use case.
 */
export default class JSONStorage
{
    protected _preferPersistence: boolean;

    protected _volatile: Storage;
    protected _persistent: Storage;

    /**
     * Initializes a new instance of the `JSONStorage` class.  
     * It cannot be instantiated outside of a browser environment or an `EnvironmentException` is thrown.
     *
     * ```ts
     * const jsonStorage = new JSONStorage();
     * ```
     *
     * ---
     * 
     * @param preferPersistence
     * Whether to prefer the `localStorage` over the `sessionStorage` when calling an ambivalent method.    
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
     * Ambivalent getter method that retrieves the value with the specified key from the default storage.
     *
     * ```ts
     * const value: TValue = jsonStorage.get<TValue>("key");
     * ```
     *
     * ---
     *
     * @param key The key of the value to retrieve.
     *
     * @returns The value with the specified key or `undefined` if the property doesn't exist.
     */
    public get<T extends JSONValue>(key: string): T | undefined;

    /**
     * Retrieves the value with the specified name from the default storage.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the property doesn't exist.
     * @param persistent Whether to override the default storage preference.
     *
     * @returns The value of the property or the default value if the property doesn't exist.
     */
    public get<T extends JSONValue>(key: string, defaultValue: T, persistent?: boolean): T;

    /**
     * Retrieves the value with the specified name from the default storage.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the property doesn't exist.
     * @param persistent Whether to override the default storage preference.
     *
     * @returns The value of the property or the default value if the property doesn't exist.
     */
    public get<T extends JSONValue>(key: string, defaultValue?: T, persistent?: boolean): T | undefined;
    public get<T extends JSONValue>(key: string, defaultValue?: T, persistent = this._preferPersistence)
        : T | undefined
    {
        const storage = persistent ? this._persistent : this._volatile;

        return this._get<T>(storage, key, defaultValue);
    }
    /**
     * Retrieves the value with the specified name from the volatile `sessionStorage`.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the property doesn't exist.
     *
     * @returns The value of the property or the default value if the property doesn't exist.
     */
    public recall<T extends JSONValue>(key: string): T | undefined;
    public recall<T extends JSONValue>(key: string, defaultValue: T): T;
    public recall<T extends JSONValue>(key: string, defaultValue?: T): T | undefined;
    public recall<T extends JSONValue>(key: string, defaultValue?: T): T | undefined
    {
        return this._get<T>(this._volatile, key, defaultValue);
    }
    /**
     * Retrieves the value with the specified name looking first in the
     * volatile `sessionStorage` and then in the persistent `localStorage`.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the property doesn't exist.
     *
     * @returns The value of the property or the default value if the property doesn't exist.
     */
    public retrieve<T extends JSONValue>(key: string): T | undefined;
    public retrieve<T extends JSONValue>(key: string, defaultValue: T): T;
    public retrieve<T extends JSONValue>(key: string, defaultValue?: T): T | undefined;
    public retrieve<T extends JSONValue>(key: string, defaultValue?: T): T | undefined
    {
        return this.recall<T>(key) ?? this.read<T>(key, defaultValue);
    }
    /**
     * Retrieves the value with the specified name from the persistent `localStorage`.
     *
     * @param key The key of the value to retrieve.
     * @param defaultValue The default value to return if the property doesn't exist.
     *
     * @returns The value of the property or the default value if the property doesn't exist.
     */
    public read<T extends JSONValue>(key: string): T | undefined;
    public read<T extends JSONValue>(key: string, defaultValue: T): T;
    public read<T extends JSONValue>(key: string, defaultValue?: T): T | undefined;
    public read<T extends JSONValue>(key: string, defaultValue?: T): T | undefined
    {
        return this._get<T>(this._persistent, key, defaultValue);
    }

    /**
     * Checks whether the property with the specified name exists in the default storage.
     *
     * @param key The key of the value to check.
     * @param persistent Whether to override the default storage preference.
     *
     * @returns `true` if the property exists, `false` otherwise.
     */
    public has(key: string, persistent?: boolean): boolean
    {
        const storage = persistent ? this._persistent : this._volatile;

        return storage.getItem(key) !== null;
    }
    /**
     * Checks whether the property with the specified name exists in the volatile `sessionStorage`.
     *
     * @param key The key of the value to check.
     *
     * @returns `true` if the property exists, `false` otherwise.
     */
    public knows(key: string): boolean
    {
        return this._volatile.getItem(key) !== null;
    }
    /**
     * Checks whether the property with the specified name exists looking first in the
     * volatile `sessionStorage` and then in the persistent `localStorage`.
     *
     * @param key The key of the value to check.
     *
     * @returns `true` if the property exists, `false` otherwise.
     */
    public find(key: string): boolean
    {
        return this.knows(key) ?? this.exists(key);
    }
    /**
     * Checks whether the property with the specified name exists in the persistent `localStorage`.
     *
     * @param key The key of the value to check.
     *
     * @returns `true` if the property exists, `false` otherwise.
     */
    public exists(key: string): boolean
    {
        return this._persistent.getItem(key) !== null;
    }

    /**
     * Sets the value with the specified name in the default storage.
     * If the value is `undefined`, the property is removed from the storage.
     *
     * @param key The key of the value to set.
     * @param newValue The new value to set.
     * @param persistent Whether to override the default storage preference.
     */
    public set<T extends JSONValue>(key: string, newValue?: T, persistent = this._preferPersistence): void
    {
        const storage = persistent ? this._persistent : this._volatile;

        this._set<T>(storage, key, newValue);
    }
    /**
     * Sets the value with the specified name in the volatile `sessionStorage`.
     * If the value is `undefined`, the property is removed from the storage.
     *
     * @param key The key of the value to set.
     * @param newValue The new value to set.
     */
    public remember<T extends JSONValue>(key: string, newValue?: T): void
    {
        this._set<T>(this._volatile, key, newValue);
    }
    /**
     * Sets the value with the specified name in the persistent `localStorage`.
     * If the value is `undefined`, the property is removed from the storage.
     *
     * @param key The key of the value to set.
     * @param newValue The new value to set.
     */
    public write<T extends JSONValue>(key: string, newValue?: T): void
    {
        this._set<T>(this._persistent, key, newValue);
    }

    /**
     * Removes the value with the specified name from the volatile `sessionStorage`.
     *
     * @param key The key of the value to remove.
     */
    public forget(key: string): void
    {
        this._volatile.removeItem(key);
    }
    /**
     * Removes the value with the specified name from the persistent `localStorage`.
     *
     * @param key The key of the value to remove.
     */
    public erase(key: string): void
    {
        this._persistent.removeItem(key);
    }
    /**
     * Removes the value with the specified name from all the storages.
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
