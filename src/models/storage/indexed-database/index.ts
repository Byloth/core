import { EnvironmentException } from "../../exceptions/index.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type JSONStorage from "../json-storage.js";
import SmartPromise from "../../promises/smart-promise.js";

import { asyncRequest, asyncTransaction, reconcileStores } from "./core.js";
import type { StoreDefinition, UpgradeHandler } from "./types.js";

/**
 * A thin, promise-based wrapper around the native {@link indexedDB} API:
 * one database, its object stores and the basic operations on each of them.
 * It's the asynchronous and Worker-safe sibling of {@link JSONStorage}.
 *
 * The store definitions passed to {@link IndexedDatabase.Open} describe the desired schema
 * and the database is upgraded to match them. See {@link StoreDefinition} for the details.
 *
 * Also note that:
 * - Values must be structured-cloneable, as required by IndexedDB itself.
 * - Failed operations reject with the native {@link DOMException} raised by IndexedDB, so its `name` can be inspected.
 * - Writing methods resolve once the transaction has been committed, not merely when the request succeeded.
 *
 * ---
 *
 * @example
 * ```ts
 * interface GameStores { saves: { slot: number, name: string } }
 *
 * const stores: StoreDefinition<keyof GameStores>[] = [{ name: "saves", keyPath: "slot" }];
 * const database = await IndexedDatabase.Open<GameStores>("game", stores, 1);
 *
 * await database.put("saves", { slot: 1, name: "First run" });
 *
 * const save = await database.get("saves", 1); // { slot: 1, name: "First run" }
 * ```
 *
 * ---
 *
 * @template T A map of the object store names to the type of the records they hold.
 */
export default class IndexedDatabase<T extends object = Record<string, unknown>>
{
    private static _CheckSupport(): void
    {
        if (typeof indexedDB === "undefined")
        {
            throw new EnvironmentException(
                "The `IndexedDatabase` class can only be used within an environment that supports IndexedDB."
            );
        }
    }

    /**
     * Opens a database, creating or upgrading it so that it matches the declared stores.
     * See {@link StoreDefinition} for how an existing schema is reconciled with the declarations.
     *
     * Also note that:
     * - It cannot be used outside of an environment that supports IndexedDB
     *   or an {@link EnvironmentException} is thrown.
     * - Requesting a version lower than the current one rejects with a `VersionError`.
     * - If another connection to the same database is still open, the returned promise
     *   stays pending until that connection is closed.
     * - The returned connection closes itself as soon as another connection requests an upgrade,
     *   so it never blocks a newer version of the application.
     *
     * ---
     *
     * @example
     * ```ts
     * interface GameStores { saves: { slot: number, name: string } }
     *
     * const stores: StoreDefinition<keyof GameStores>[] = [
     *     { name: "saves", keyPath: "slot", indexes: [{ name: "byName", keyPath: "name" }] }
     * ];
     *
     * const database = await IndexedDatabase.Open<GameStores>("game", stores, 1);
     * ```
     *
     * ---
     *
     * @template T A map of the object store names to the type of the records they hold.
     *
     * @param name The name of the database.
     * @param stores The definitions of the object stores the database must contain.
     * @param version The version of the database. It must be a positive integer.
     *
     * @returns A {@link SmartPromise} that resolves with the opened {@link IndexedDatabase} instance.
     */
    public static Open<T extends object = Record<string, unknown>>(
        name: string, stores: readonly StoreDefinition<keyof T & string>[], version: number
    ): SmartPromise<IndexedDatabase<T>>;

    /**
     * Opens a database, creating or upgrading it so that it matches the declared stores,
     * then runs a custom migration within the same upgrade transaction.
     *
     * The whole upgrade is atomic: if the handler throws or rejects, the returned promise rejects
     * with that very error and the database is left untouched at its previous version.
     * See {@link UpgradeHandler} for what the handler is allowed to await.
     *
     * Also note that:
     * - It cannot be used outside of an environment that supports IndexedDB
     *   or an {@link EnvironmentException} is thrown.
     * - Requesting a version lower than the current one rejects with a `VersionError`.
     * - If another connection to the same database is still open, the returned promise
     *   stays pending until that connection is closed.
     * - The returned connection closes itself as soon as another connection requests an upgrade,
     *   so it never blocks a newer version of the application.
     *
     * ---
     *
     * @example
     * ```ts
     * interface GameStores { saves: { slot: number, name: string } }
     *
     * const stores: StoreDefinition<keyof GameStores>[] = [
     *     { name: "saves", keyPath: "slot", indexes: [{ name: "byName", keyPath: "name" }] }
     * ];
     * const onUpgrade: UpgradeHandler = async (database, oldVersion, newVersion, transaction) =>
     * {
     *     if (oldVersion < 2) { database.deleteObjectStore("legacy"); }
     * };
     *
     * const database = await IndexedDatabase.Open<GameStores>("game", stores, 2, onUpgrade);
     * ```
     *
     * ---
     *
     * @template T A map of the object store names to the type of the records they hold.
     *
     * @param name The name of the database.
     * @param stores The definitions of the object stores the database must contain.
     * @param version The version of the database. It must be a positive integer.
     * @param onUpgrade The {@link UpgradeHandler} invoked when the database is created or upgraded.
     *
     * @returns A {@link SmartPromise} that resolves with the opened {@link IndexedDatabase} instance.
     */
    public static Open<T extends object = Record<string, unknown>>(
        name: string,
        stores: readonly StoreDefinition<keyof T & string>[],
        version: number,
        onUpgrade: UpgradeHandler
    ): SmartPromise<IndexedDatabase<T>>;
    public static Open<T extends object = Record<string, unknown>>(
        name: string,
        stores: readonly StoreDefinition<keyof T & string>[],
        version: number,
        onUpgrade?: UpgradeHandler
    ): SmartPromise<IndexedDatabase<T>>
    {
        IndexedDatabase._CheckSupport();

        return new SmartPromise((resolve, reject) =>
        {
            let failure: unknown;

            const request = indexedDB.open(name, version);
            request.onupgradeneeded = async (evt) =>
            {
                const database = request.result;
                const transaction = request.transaction!;
                const oldVersion = evt.oldVersion;
                const newVersion = evt.newVersion ?? version;

                try
                {
                    await reconcileStores(database, transaction, stores, oldVersion);

                    if (!(onUpgrade)) { return; }
                    await onUpgrade(database, oldVersion, newVersion, transaction);
                }
                catch (error)
                {
                    failure = error;

                    try
                    {
                        transaction.abort();
                    }
                    catch { /* The transaction has already been completed or aborted. */ }
                }
            };

            request.onsuccess = () =>
            {
                const database = request.result;
                if (failure !== undefined)
                {
                    database.close();
                    reject(failure);

                    return;
                }

                database.onversionchange = () => database.close();

                resolve(new IndexedDatabase<T>(database));
            };

            request.onerror = () => reject(failure ?? request.error);
        });
    }

    /**
     * Deletes a whole database.
     *
     * Also note that:
     * - It cannot be used outside of an environment that supports IndexedDB
     *   or an {@link EnvironmentException} is thrown.
     * - If a connection to the database is still open, the returned promise
     *   stays pending until that connection is closed.
     *
     * ---
     *
     * @example
     * ```ts
     * database.close();
     *
     * await IndexedDatabase.Delete("game");
     * ```
     *
     * ---
     *
     * @param name The name of the database to delete.
     *
     * @returns A {@link SmartPromise} that resolves once the database has been deleted.
     */
    public static Delete(name: string): SmartPromise<void>
    {
        IndexedDatabase._CheckSupport();

        return new SmartPromise((resolve, reject) =>
        {
            const request = indexedDB.deleteDatabase(name);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Wraps a native IndexedDB request into a {@link SmartPromise}.
     * It's meant for {@link UpgradeHandler} implementations and for subclasses issuing their own requests.
     *
     * ---
     *
     * @example
     * ```ts
     * const saves = await IndexedDatabase.Request(transaction.objectStore("saves").getAll());
     * ```
     *
     * ---
     *
     * @template T The type of the request result.
     *
     * @param request The request to wrap.
     *
     * @returns A {@link SmartPromise} that resolves with the request result or rejects with its error.
     */
    public static Request<T>(request: IDBRequest<T>): SmartPromise<T> { return asyncRequest(() => request); }

    protected readonly _database: IDBDatabase;

    private constructor(database: IDBDatabase)
    {
        this._database = database;
    }

    /**
     * The name of the database.
     */
    public get name(): string { return this._database.name; }

    /**
     * The current version of the database.
     */
    public get version(): number { return this._database.version; }

    /**
     * The names of the object stores the database contains.
     */
    public get stores(): string[] { return Array.from(this._database.objectStoreNames); }

    /**
     * Retrieves the record with the specified key from an object store.
     *
     * ---
     *
     * @example
     * ```ts
     * const save = await database.get("saves", 1);
     * ```
     *
     * ---
     *
     * @template K The name of the object store.
     *
     * @param store The name of the object store.
     * @param key The key of the record to retrieve.
     *
     * @returns A {@link SmartPromise} that resolves with the record, or `undefined` if it doesn't exist.
     */
    public get<K extends keyof T & string>(store: K, key: IDBValidKey): SmartPromise<T[K] | undefined>
    {
        return asyncRequest(() =>
        {
            return this._database.transaction(store, "readonly")
                .objectStore(store)
                .get(key) as IDBRequest<T[K] | undefined>;
        });
    }

    /**
     * Retrieves all the records of an object store.
     *
     * ---
     *
     * @example
     * ```ts
     * const saves = await database.getAll("saves");
     * ```
     *
     * ---
     *
     * @template K The name of the object store.
     *
     * @param store The name of the object store.
     *
     * @returns A {@link SmartPromise} that resolves with an array containing all the records of the store.
     */
    public getAll<K extends keyof T & string>(store: K): SmartPromise<T[K][]>
    {
        return asyncRequest(() =>
        {
            return this._database.transaction(store, "readonly")
                .objectStore(store)
                .getAll() as IDBRequest<T[K][]>;
        });
    }

    /**
     * Checks whether a record with the specified key exists within an object store.
     *
     * ---
     *
     * @example
     * ```ts
     * if (await database.has("saves", 1))
     * {
     *     // The save exists. Do something...
     * }
     * ```
     *
     * ---
     *
     * @template K The name of the object store.
     *
     * @param store The name of the object store.
     * @param key The key of the record to check.
     *
     * @returns A {@link Promise} that resolves with `true` if the record exists, `false` otherwise.
     */
    public async has<K extends keyof T & string>(store: K, key: IDBValidKey): Promise<boolean>
    {
        const count = await asyncRequest(() =>
        {
            return this._database.transaction(store, "readonly")
                .objectStore(store)
                .count(key);
        });

        return (count > 0);
    }

    /**
     * Stores a record into an object store using in-line keys, overwriting any existing record with the same key.
     * The returned promise resolves once the transaction has been committed.
     *
     * ---
     *
     * @example
     * ```ts
     * await database.put("saves", { slot: 1, name: "First run" });
     * ```
     *
     * ---
     *
     * @template K The name of the object store.
     *
     * @param store The name of the object store.
     * @param value The record to store. Its key is extracted through the store's `keyPath`.
     *
     * @returns A {@link SmartPromise} that resolves once the record has been committed.
     */
    public put<K extends keyof T & string>(store: K, value: T[K]): SmartPromise<void>;

    /**
     * Stores a record into an object store using out-of-line keys, overwriting any existing record with the same key.
     * The returned promise resolves once the transaction has been committed.
     *
     * Also note that:
     * - Providing a key for a store with a `keyPath` rejects with a `DataError`.
     *
     * ---
     *
     * @example
     * ```ts
     * await database.put("logs", "Something happened", Date.now());
     * ```
     *
     * ---
     *
     * @template K The name of the object store.
     *
     * @param store The name of the object store.
     * @param value The record to store.
     * @param key The key of the record.
     *
     * @returns A {@link SmartPromise} that resolves once the record has been committed.
     */
    public put<K extends keyof T & string>(store: K, value: T[K], key: IDBValidKey): SmartPromise<void>;
    public put<K extends keyof T & string>(store: K, value: T[K], key?: IDBValidKey): SmartPromise<void>
    {
        return asyncTransaction(() =>
        {
            const transaction = this._database.transaction(store, "readwrite");
            transaction.objectStore(store)
                .put(value, key);

            return transaction;
        });
    }

    /**
     * Removes the record with the specified key from an object store.
     * The returned promise resolves once the transaction has been committed.
     *
     * ---
     *
     * @example
     * ```ts
     * await database.delete("saves", 1);
     * ```
     *
     * ---
     *
     * @template K The name of the object store.
     *
     * @param store The name of the object store.
     * @param key The key of the record to remove.
     *
     * @returns A {@link SmartPromise} that resolves once the removal has been committed.
     */
    public delete<K extends keyof T & string>(store: K, key: IDBValidKey): SmartPromise<void>
    {
        return asyncTransaction(() =>
        {
            const transaction = this._database.transaction(store, "readwrite");
            transaction.objectStore(store)
                .delete(key);

            return transaction;
        });
    }

    /**
     * Removes all the records from an object store.
     * The returned promise resolves once the transaction has been committed.
     *
     * ---
     *
     * @example
     * ```ts
     * await database.clear("logs");
     * ```
     *
     * ---
     *
     * @template K The name of the object store.
     *
     * @param store The name of the object store.
     *
     * @returns A {@link SmartPromise} that resolves once the removal has been committed.
     */
    public clear<K extends keyof T & string>(store: K): SmartPromise<void>
    {
        return asyncTransaction(() =>
        {
            const transaction = this._database.transaction(store, "readwrite");
            transaction.objectStore(store)
                .clear();

            return transaction;
        });
    }

    /**
     * Closes the connection to the database.
     * Any operation attempted afterwards rejects with an `InvalidStateError`.
     *
     * ---
     *
     * @example
     * ```ts
     * database.close();
     * ```
     */
    public close(): void { this._database.close(); }

    public readonly [Symbol.toStringTag]: string = "IndexedDatabase";
}
