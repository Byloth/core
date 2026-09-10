import SmartPromise from "../../promises/smart-promise.js";
import type { IndexDefinition, InlineStoreDefinition, StoreDefinition } from "./types.js";

/**
 * Issues a native IndexedDB request and wraps it into a {@link SmartPromise}
 * that resolves with the request result or rejects with its error.  
 * The request is created within the promise, so any synchronous error becomes a rejection too.
 *
 * ---
 *
 * @template T The type of the request result.
 *
 * @param request The function creating the request.
 *
 * @returns A {@link SmartPromise} settled by the request.
 */
export const asyncRequest = <T>(request: () => IDBRequest<T>): SmartPromise<T> =>
    new SmartPromise<T>((resolve, reject) =>
    {
        const _request = request();

        _request.onsuccess = () => resolve(_request.result);
        _request.onerror = () => reject(_request.error);
    });

/**
 * Runs a native IndexedDB transaction and wraps it into a {@link SmartPromise}
 * that resolves once it has been committed or rejects if it fails or aborts.  
 * The transaction is created within the promise, so any synchronous error becomes a rejection too.
 *
 * ---
 *
 * @param transaction The function creating the transaction and issuing its requests.
 *
 * @returns A {@link SmartPromise} settled by the transaction.
 */
export const asyncTransaction = (transaction: () => IDBTransaction): SmartPromise<void> =>
    new SmartPromise<void>((resolve, reject) =>
    {
        const _transaction = transaction();

        _transaction.oncomplete = () => resolve();
        _transaction.onerror = () => reject(_transaction.error);
        _transaction.onabort = () => reject(_transaction.error);
    });

function _createIndexes(store: IDBObjectStore, indexes: readonly IndexDefinition[] = []): void
{
    for (const definition of indexes)
    {
        store.createIndex(definition.name, definition.keyPath, {
            unique: definition.unique,
            multiEntry: definition.multiEntry
        });
    }
}
function _createStore(database: IDBDatabase, definition: StoreDefinition): IDBObjectStore
{
    const store = database.createObjectStore(definition.name, {
        keyPath: definition.keyPath,
        autoIncrement: definition.autoIncrement
    });

    _createIndexes(store, definition.indexes);

    return store;
}

type KeyPath = string | string[] | null | undefined;

function _equalsKeyPaths(first: KeyPath, second: KeyPath): boolean
{
    const _first = first ?? null;
    const _second = second ?? null;

    if (_first !== _second)
    {
        if (!(Array.isArray(_first)) || !(Array.isArray(_second))) { return false; }

        if (_first.length !== _second.length) { return false; }
        for (let index = 0; index < _first.length; index += 1)
        {
            if (_first[index] !== _second[index]) { return false; }
        }
    }

    return true;
}

const _equalsIndexes = (first: IndexDefinition, second: IndexDefinition): boolean =>
    _equalsKeyPaths(first.keyPath, second.keyPath) &&
    ((first.unique ?? false) === (second.unique ?? false)) &&
    ((first.multiEntry ?? false) === (second.multiEntry ?? false));

const _equalsStores = (first: StoreDefinition, second: StoreDefinition): boolean =>
    _equalsKeyPaths(first.keyPath, second.keyPath) &&
    ((first.autoIncrement ?? false) === (second.autoIncrement ?? false));

const _readAll = (store: IDBObjectStore): Promise<[IDBValidKey[], unknown[]]> =>
    Promise.all([
        asyncRequest(() => store.getAllKeys()),
        asyncRequest(() => store.getAll() as IDBRequest<unknown[]>)
    ]);

const _isInline = (definition: StoreDefinition): definition is InlineStoreDefinition =>
    (definition.keyPath !== undefined) && (definition.keyPath !== null);

type Migration = [IDBValidKey | undefined, unknown] | undefined;
type MigrationHandler = (record: unknown, key: IDBValidKey, oldVersion: number) => Migration;

function _toMigrationHandler(definition: StoreDefinition): MigrationHandler
{
    if (!(_isInline(definition))) { return definition.migrate ?? ((record, key) => [key, record]); }

    const migrate = definition.migrate;
    if (!(migrate)) { return (record) => [undefined, record]; }

    return (record, key, oldVersion) =>
    {
        const value = migrate(record, key, oldVersion);
        if (value === undefined) { return undefined; }

        return [undefined, value];
    };
}

async function _recreateStore(
    database: IDBDatabase, transaction: IDBTransaction, definition: StoreDefinition, oldVersion: number
): Promise<void>
{
    const _migrate = _toMigrationHandler(definition);
    const [keys, values] = await _readAll(transaction.objectStore(definition.name));

    database.deleteObjectStore(definition.name);

    const store = _createStore(database, definition);
    for (let index = 0; index < values.length; index += 1)
    {
        const migration = _migrate(values[index], keys[index], oldVersion);
        if (migration === undefined) { continue; }

        const [key, value] = migration;
        store.put(value, key);
    }
}

function _reconcileIndexes(store: IDBObjectStore, indexes: readonly IndexDefinition[] = []): void
{
    const indexNames = new Set(indexes.map((index) => index.name));
    for (const indexName of store.indexNames)
    {
        if (indexNames.has(indexName)) { continue; }

        store.deleteIndex(indexName);
    }

    for (const definition of indexes)
    {
        if (store.indexNames.contains(definition.name))
        {
            const index = store.index(definition.name);
            if (_equalsIndexes(index, definition)) { continue; }

            store.deleteIndex(definition.name);
        }

        store.createIndex(definition.name, definition.keyPath, {
            unique: definition.unique,
            multiEntry: definition.multiEntry
        });
    }
}
async function _migrateRecords(store: IDBObjectStore, definition: StoreDefinition, oldVersion: number): Promise<void>
{
    if (!(definition.migrate)) { return; }

    const _migrate = _toMigrationHandler(definition);
    const _isUntouched = _isInline(definition) ?
        (): boolean => true :
        (newKey: IDBValidKey | undefined, oldKey: IDBValidKey): boolean => (newKey === oldKey);

    const [keys, values] = await _readAll(store);
    for (let index = 0; index < values.length; index += 1)
    {
        const oldKey = keys[index];
        const oldValue = values[index];

        const migration = _migrate(oldValue, oldKey, oldVersion);
        if (migration === undefined)
        {
            store.delete(oldKey);

            continue;
        }

        const [newKey, newValue] = migration;
        if ((newValue === oldValue) && _isUntouched(newKey, oldKey)) { continue; }

        store.delete(oldKey);
        store.put(newValue, newKey);
    }
}

/**
 * Reconciles the schema of a database with the declared stores, store by store,
 * migrating their records where needed. See {@link StoreDefinition} for the rules.
 * It must run within the `versionchange` transaction of an upgrade.
 *
 * ---
 *
 * @param database The database being upgraded.
 * @param transaction The `versionchange` transaction the upgrade runs in.
 * @param definitions The definitions of the object stores the database must contain.
 * @param oldVersion The version the database is upgrading from.
 *
 * @returns A {@link Promise} that resolves once every store has been reconciled.
 */
export async function reconcileStores(
    database: IDBDatabase, transaction: IDBTransaction, definitions: readonly StoreDefinition[], oldVersion: number
): Promise<void>
{
    for (const definition of definitions)
    {
        if (!(database.objectStoreNames.contains(definition.name)))
        {
            _createStore(database, definition);

            continue;
        }

        const store = transaction.objectStore(definition.name);
        if (!(_equalsStores(store, definition)))
        {
            await _recreateStore(database, transaction, definition, oldVersion);

            continue;
        }

        _reconcileIndexes(store, definition.indexes);
        await _migrateRecords(store, definition, oldVersion);
    }
}
