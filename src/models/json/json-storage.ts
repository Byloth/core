
import { isBrowser } from "../../helpers.js";
import { EnvironmentException } from "../exceptions/index.js";

import type { JSONValue } from "./types.js";

/**
 * A wrapper around the `Storage` API to store and retrieve JSON values.
 *
 * It allows to handle either the `sessionStorage` or the `localStorage`
 * storage at the same time, depending on the required use case.
 */
export default class JSONStorage
{
    protected _preferPersistence: boolean;

    protected _volatile: Storage;
    protected _persistent: Storage;

    public constructor(preferPersistence = true)
    {
        this._preferPersistence = preferPersistence;

        if (!(isBrowser))
        {
            throw new EnvironmentException(
                "The `JSONStorage` class can only be instantiated within a browser environment."
            );
        }

        this._volatile = window.sessionStorage;
        this._persistent = window.localStorage;
    }

    protected _get<T extends JSONValue>(storage: Storage, propertyName: string): T | undefined;
    protected _get<T extends JSONValue>(storage: Storage, propertyName: string, defaultValue: T): T;
    protected _get<T extends JSONValue>(storage: Storage, propertyName: string, defaultValue?: T): T | undefined;
    protected _get<T extends JSONValue>(storage: Storage, propertyName: string, defaultValue?: T): T | undefined
    {
        const propertyValue = storage.getItem(propertyName);
        if (propertyValue)
        {
            try
            {
                return JSON.parse(propertyValue);
            }
            catch
            {
                // eslint-disable-next-line no-console
                console.warn(
                    `The "${propertyValue}" value for "${propertyName}"` +
                    " property cannot be parsed. Clearing the storage...");

                storage.removeItem(propertyName);
            }
        }

        return defaultValue;
    }
    protected _set<T extends JSONValue>(storage: Storage, propertyName: string, newValue?: T): void
    {
        const encodedValue = JSON.stringify(newValue);
        if (encodedValue)
        {
            storage.setItem(propertyName, encodedValue);
        }
        else
        {
            storage.removeItem(propertyName);
        }
    }

    /**
     * Retrieves the value with the specified name from the corresponding storage.
     *
     * @param propertyName The name of the property to retrieve.
     * @param defaultValue The default value to return if the property does not exist.
     * @param persistent Whether to use the persistent `localStorage` or the volatile `sessionStorage`.
     *
     * @returns The value of the property or the default value if the property does not exist.
     */
    public get<T extends JSONValue>(propertyName: string, defaultValue: undefined, persistent?: boolean): T | undefined;
    public get<T extends JSONValue>(propertyName: string, defaultValue: T, persistent?: boolean): T ;
    public get<T extends JSONValue>(propertyName: string, defaultValue?: T, persistent?: boolean): T | undefined;
    public get<T extends JSONValue>(propertyName: string, defaultValue?: T, persistent = this._preferPersistence)
        : T | undefined
    {
        const storage = persistent ? this._persistent : this._volatile;

        return this._get<T>(storage, propertyName, defaultValue);
    }
    /**
     * Retrieves the value with the specified name from the volatile `sessionStorage`.
     *
     * @param propertyName The name of the property to retrieve.
     * @param defaultValue The default value to return if the property does not exist.
     *
     * @returns The value of the property or the default value if the property does not exist.
     */
    public recall<T extends JSONValue>(propertyName: string): T | undefined;
    public recall<T extends JSONValue>(propertyName: string, defaultValue: T): T;
    public recall<T extends JSONValue>(propertyName: string, defaultValue?: T): T | undefined;
    public recall<T extends JSONValue>(propertyName: string, defaultValue?: T): T | undefined
    {
        return this._get<T>(this._volatile, propertyName, defaultValue);
    }
    /**
     * Retrieves the value with the specified name looking first in the
     * volatile `sessionStorage` and then in the persistent `localStorage`.
     *
     * @param propertyName The name of the property to retrieve.
     * @param defaultValue The default value to return if the property does not exist.
     *
     * @returns The value of the property or the default value if the property does not exist.
     */
    public retrieve<T extends JSONValue>(propertyName: string): T | undefined;
    public retrieve<T extends JSONValue>(propertyName: string, defaultValue: T): T;
    public retrieve<T extends JSONValue>(propertyName: string, defaultValue?: T): T | undefined;
    public retrieve<T extends JSONValue>(propertyName: string, defaultValue?: T): T | undefined
    {
        return this.recall<T>(propertyName) ?? this.read<T>(propertyName, defaultValue);
    }
    /**
     * Retrieves the value with the specified name from the persistent `localStorage`.
     *
     * @param propertyName The name of the property to retrieve.
     * @param defaultValue The default value to return if the property does not exist.
     *
     * @returns The value of the property or the default value if the property does not exist.
     */
    public read<T extends JSONValue>(propertyName: string): T | undefined;
    public read<T extends JSONValue>(propertyName: string, defaultValue: T): T;
    public read<T extends JSONValue>(propertyName: string, defaultValue?: T): T | undefined;
    public read<T extends JSONValue>(propertyName: string, defaultValue?: T): T | undefined
    {
        return this._get<T>(this._persistent, propertyName, defaultValue);
    }

    /**
     * Checks whether the property with the specified name exists in the corresponding storage.
     *
     * @param propertyName The name of the property to check.
     * @param persistent Whether to use the persistent `localStorage` or the volatile `sessionStorage`.
     *
     * @returns `true` if the property exists, `false` otherwise.
     */
    public has(propertyName: string, persistent?: boolean): boolean
    {
        const storage = persistent ? this._persistent : this._volatile;

        return storage.getItem(propertyName) !== null;
    }
    /**
     * Checks whether the property with the specified name exists in the volatile `sessionStorage`.
     *
     * @param propertyName The name of the property to check.
     *
     * @returns `true` if the property exists, `false` otherwise.
     */
    public knows(propertyName: string): boolean
    {
        return this._volatile.getItem(propertyName) !== null;
    }
    /**
     * Checks whether the property with the specified name exists looking first in the
     * volatile `sessionStorage` and then in the persistent `localStorage`.
     *
     * @param propertyName The name of the property to check.
     *
     * @returns `true` if the property exists, `false` otherwise.
     */
    public find(propertyName: string): boolean
    {
        return this.knows(propertyName) ?? this.exists(propertyName);
    }
    /**
     * Checks whether the property with the specified name exists in the persistent `localStorage`.
     *
     * @param propertyName The name of the property to check.
     *
     * @returns `true` if the property exists, `false` otherwise.
     */
    public exists(propertyName: string): boolean
    {
        return this._persistent.getItem(propertyName) !== null;
    }

    /**
     * Sets the value with the specified name in the corresponding storage.
     * If the value is `undefined`, the property is removed from the storage.
     *
     * @param propertyName The name of the property to set.
     * @param newValue The new value to set.
     * @param persistent Whether to use the persistent `localStorage` or the volatile `sessionStorage`.
     */
    public set<T extends JSONValue>(propertyName: string, newValue?: T, persistent = this._preferPersistence): void
    {
        const storage = persistent ? this._persistent : this._volatile;

        this._set<T>(storage, propertyName, newValue);
    }
    /**
     * Sets the value with the specified name in the volatile `sessionStorage`.
     * If the value is `undefined`, the property is removed from the storage.
     *
     * @param propertyName The name of the property to set.
     * @param newValue The new value to set.
     */
    public remember<T extends JSONValue>(propertyName: string, newValue?: T): void
    {
        this._set<T>(this._volatile, propertyName, newValue);
    }
    /**
     * Sets the value with the specified name in the persistent `localStorage`.
     * If the value is `undefined`, the property is removed from the storage.
     *
     * @param propertyName The name of the property to set.
     * @param newValue The new value to set.
     */
    public write<T extends JSONValue>(propertyName: string, newValue?: T): void
    {
        this._set<T>(this._persistent, propertyName, newValue);
    }

    /**
     * Removes the value with the specified name from the volatile `sessionStorage`.
     *
     * @param propertyName The name of the property to remove.
     */
    public forget(propertyName: string): void
    {
        this._volatile.removeItem(propertyName);
    }
    /**
     * Removes the value with the specified name from the persistent `localStorage`.
     *
     * @param propertyName The name of the property to remove.
     */
    public erase(propertyName: string): void
    {
        this._persistent.removeItem(propertyName);
    }
    /**
     * Removes the value with the specified name from all the storages.
     *
     * @param propertyName The name of the property to remove.
     */
    public clear(propertyName: string): void
    {
        this._volatile.removeItem(propertyName);
        this._persistent.removeItem(propertyName);
    }

    public readonly [Symbol.toStringTag]: string = "JSONStorage";
}
