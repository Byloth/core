import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";

import { EnvironmentException, RuntimeException } from "../../../src/index.js";
import { IndexedDatabase } from "../../../src/index.js";

import type { InlineMigrationHandler, StoreDefinition, UpgradeHandler } from "../../../src/index.js";

interface SaveRecord
{
    slot: number;
    name: string;
}
interface Stores {
    saves: SaveRecord;
    logs: string;
    notes: string;
}

const DatabaseName = "test";
const Definitions: readonly StoreDefinition<keyof Stores>[] = [
    { name: "saves", keyPath: "slot", indexes: [{ name: "byName", keyPath: "name" }] },
    { name: "logs", autoIncrement: true },
    { name: "notes" }
];

const _open = (version = 1, onUpgrade?: UpgradeHandler) => ((onUpgrade) ?
    IndexedDatabase.Open<Stores>(DatabaseName, Definitions, version, onUpgrade) :
    IndexedDatabase.Open<Stores>(DatabaseName, Definitions, version));

const _openRaw = (version = 1): Promise<IDBDatabase> => new Promise((resolve, reject) =>
{
    const request = indexedDB.open(DatabaseName, version);

    request.onupgradeneeded = () => { request.result.createObjectStore("saves", { keyPath: "slot" }); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
});

describe("IndexedDatabase", () =>
{
    beforeEach(() => { vi.stubGlobal("indexedDB", new IDBFactory()); });
    afterEach(() =>
    {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe("Open", () =>
    {
        it("Should open a database exposing its name, version and stores", async () =>
        {
            const database = await _open();

            expect(database).toBeInstanceOf(IndexedDatabase);
            expect(database.name).toBe(DatabaseName);
            expect(database.version).toBe(1);
            expect(database.stores).toEqual(["logs", "notes", "saves"]);

            database.close();
        });
        it("Should create the declared indexes", async () =>
        {
            const onUpgrade = vi.fn<UpgradeHandler>((_database, _oldVersion, _newVersion, transaction) =>
            {
                expect(Array.from(transaction.objectStore("saves").indexNames)).toEqual(["byName"]);
            });

            const database = await _open(1, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledTimes(1);

            database.close();
        });
        it("Should invoke the upgrade handler with the old and new versions", async () =>
        {
            const onUpgrade = vi.fn();
            const database = await _open(1, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledWith(expect.any(Object), 0, 1, expect.any(Object));

            database.close();
        });
        it("Should keep the data when reopening the same version", async () =>
        {
            const first = await _open();
            await first.put("saves", { slot: 1, name: "First run" });
            first.close();

            const second = await _open();

            expect(await second.get("saves", 1)).toEqual({ slot: 1, name: "First run" });

            second.close();
        });
        it("Should upgrade an existing database, creating the missing stores", async () =>
        {
            const first = await IndexedDatabase.Open<Stores>(DatabaseName, [Definitions[0]], 1);
            await first.put("saves", { slot: 1, name: "First run" });

            expect(first.stores).toEqual(["saves"]);

            first.close();

            const onUpgrade = vi.fn();
            const second = await _open(2, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledWith(expect.any(Object), 1, 2, expect.any(Object));
            expect(second.version).toBe(2);
            expect(second.stores).toEqual(["logs", "notes", "saves"]);
            expect(await second.get("saves", 1)).toEqual({ slot: 1, name: "First run" });

            second.close();
        });
        it("Should not invoke the upgrade handler when the version is unchanged", async () =>
        {
            const first = await _open();
            first.close();

            const onUpgrade = vi.fn();
            const second = await _open(1, onUpgrade);

            expect(onUpgrade).not.toHaveBeenCalled();

            second.close();
        });

        it("Should throw `EnvironmentException` if IndexedDB isn't supported", () =>
        {
            vi.stubGlobal("indexedDB", undefined);

            expect(() => _open())
                .toThrow(EnvironmentException);
        });
        it("Should reject with `VersionError` when requesting an older version", async () =>
        {
            const database = await _open(2);
            database.close();

            await expect(_open(1))
                .rejects.toMatchObject({ name: "VersionError" });
        });
        it("Should reject with `RuntimeException` when another connection blocks the upgrade", async () =>
        {
            const raw = await _openRaw(1);

            await expect(_open(2))
                .rejects.toThrow(RuntimeException);

            raw.close();

            const database = await _open(2);

            expect(database.version).toBe(2);

            database.close();
        });
        it("Should reject with `RuntimeException` when the upgrade fails after its transaction committed", async () =>
        {
            const onUpgrade: UpgradeHandler = async (_database, _oldVersion, _newVersion, transaction) =>
            {
                await new Promise((resolve) => transaction.addEventListener("complete", resolve));

                throw new Error("Nope.");
            };

            await expect(_open(2, onUpgrade))
                .rejects.toThrow(/already been committed/);

            const spy = vi.fn();
            const database = await _open(2, spy);

            expect(spy).not.toHaveBeenCalled();
            expect(database.version).toBe(2);

            database.close();
        });
    });

    describe("Open (schema reconciliation)", () =>
    {
        interface MigratedRecord
        {
            id: number;
            name: string;
        }
        interface MigratedStores {
            saves: MigratedRecord;
            logs: string;
            notes: string;
        }

        const _seed = async () =>
        {
            const database = await _open();
            await database.put("saves", { slot: 1, name: "First run" });
            await database.put("saves", { slot: 2, name: "Second run" });
            await database.put("notes", "Remember this", "todo");
            database.close();
        };

        it("Should recreate an index whose options changed", async () =>
        {
            await _seed();

            const definitions: readonly StoreDefinition<keyof Stores>[] = [
                { name: "saves", keyPath: "slot", indexes: [{ name: "byName", keyPath: "slot", unique: true }] }
            ];

            const upgraded = await IndexedDatabase.Open<Stores>(DatabaseName, definitions, 2);

            expect(await upgraded.getAll("saves")).toHaveLength(2);

            upgraded.close();

            const onUpgrade = vi.fn<UpgradeHandler>((_database, _oldVersion, _newVersion, transaction) =>
            {
                const index = transaction.objectStore("saves").index("byName");

                expect(index.keyPath).toBe("slot");
                expect(index.unique).toBe(true);
            });
            const database = await IndexedDatabase.Open<Stores>(DatabaseName, definitions, 3, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledTimes(1);

            database.close();
        });
        it("Should delete an index that is no longer declared", async () =>
        {
            await _seed();

            const onUpgrade = vi.fn<UpgradeHandler>((_database, _oldVersion, _newVersion, transaction) =>
            {
                expect(Array.from(transaction.objectStore("saves").indexNames)).toEqual([]);
            });
            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "saves", keyPath: "slot" }

            ], 2, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledTimes(1);

            database.close();
        });
        it("Should create an index added to an existing store", async () =>
        {
            await _seed();

            const onUpgrade = vi.fn<UpgradeHandler>((_database, _oldVersion, _newVersion, transaction) =>
            {
                expect(Array.from(transaction.objectStore("logs").indexNames)).toEqual(["byLength"]);
            });
            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "logs", autoIncrement: true, indexes: [{ name: "byLength", keyPath: "length" }] }

            ], 2, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledTimes(1);

            database.close();
        });
        it("Should recreate a store whose key path changed, migrating its records", async () =>
        {
            await _seed();

            const database = await IndexedDatabase.Open<MigratedStores>(DatabaseName, [
                {
                    name: "saves",
                    keyPath: "id",
                    migrate: (record) =>
                    {
                        const { slot, name } = record as SaveRecord;

                        return { id: slot, name: name };
                    }
                }

            ], 2);

            expect(await database.getAll("saves")).toEqual([
                { id: 1, name: "First run" },
                { id: 2, name: "Second run" }
            ]);
            expect(await database.has("saves", 1)).toBe(true);

            database.close();
        });
        it("Should copy the records unchanged when no `migrate` function is provided", async () =>
        {
            await _seed();

            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "saves", keyPath: "name" }

            ], 2);

            expect(await database.get("saves", "First run")).toEqual({ slot: 1, name: "First run" });
            expect(await database.getAll("saves")).toHaveLength(2);

            database.close();
        });
        it("Should drop the records for which `migrate` returns `undefined`", async () =>
        {
            await _seed();

            const database = await IndexedDatabase.Open<MigratedStores>(DatabaseName, [
                {
                    name: "saves",
                    keyPath: "id",
                    migrate: (record) =>
                    {
                        const { slot, name } = record as SaveRecord;
                        if (slot === 1) { return undefined; }

                        return { id: slot, name: name };
                    }
                }

            ], 2);

            expect(await database.getAll("saves")).toEqual([{ id: 2, name: "Second run" }]);

            database.close();
        });
        it("Should preserve out-of-line keys when only `autoIncrement` changes", async () =>
        {
            await _seed();

            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "notes", autoIncrement: true }

            ], 2);

            expect(await database.get("notes", "todo")).toBe("Remember this");

            database.close();
        });
        it("Should keep the stores that are no longer declared", async () =>
        {
            await _seed();

            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "saves", keyPath: "slot" }

            ], 2);

            expect(database.stores).toEqual(["logs", "notes", "saves"]);
            expect(await database.get("notes", "todo")).toBe("Remember this");

            database.close();
        });
        it("Should invoke the upgrade handler after the schema has been reconciled", async () =>
        {
            await _seed();

            const onUpgrade = vi.fn<UpgradeHandler>((_database, _oldVersion, _newVersion, transaction) =>
            {
                expect(transaction.objectStore("saves").keyPath).toBe("id");
            });
            const database = await IndexedDatabase.Open<MigratedStores>(DatabaseName, [
                { name: "saves", keyPath: "id", migrate: (record) => ({ id: (record as SaveRecord).slot, name: "" }) }

            ], 2, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledTimes(1);

            database.close();
        });
        it("Should migrate the records in place when the store is unchanged", async () =>
        {
            await _seed();

            const migrate = vi.fn<InlineMigrationHandler>((record) =>
                ({ ...(record as SaveRecord), difficulty: "normal" }));

            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "saves", keyPath: "slot", indexes: [{ name: "byName", keyPath: "name" }], migrate: migrate }

            ], 2);

            expect(migrate).toHaveBeenCalledTimes(2);
            expect(migrate).toHaveBeenCalledWith({ slot: 1, name: "First run" }, 1, 1);
            expect(await database.getAll("saves")).toEqual([
                { slot: 1, name: "First run", difficulty: "normal" },
                { slot: 2, name: "Second run", difficulty: "normal" }
            ]);

            database.close();
        });
        it("Should not rewrite the records left untouched by `migrate`", async () =>
        {
            await _seed();

            const put = vi.spyOn(IDBObjectStore.prototype, "put");
            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                {
                    name: "saves",
                    keyPath: "slot",
                    indexes: [{ name: "byName", keyPath: "name" }],
                    migrate: (record) => record
                },
                { name: "notes", migrate: (record, key) => [key, record] }

            ], 2);

            expect(put).not.toHaveBeenCalled();
            expect(await database.getAll("saves")).toHaveLength(2);
            expect(await database.get("notes", "todo")).toBe("Remember this");

            database.close();
        });
        it("Should delete the records in place when `migrate` returns `undefined`", async () =>
        {
            await _seed();

            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                {
                    name: "saves",
                    keyPath: "slot",
                    migrate: (record) => (((record as SaveRecord).slot === 1) ? undefined : record)
                }

            ], 2);

            expect(await database.getAll("saves")).toEqual([{ slot: 2, name: "Second run" }]);

            database.close();
        });
        it("Should change out-of-line keys through the tuple returned by `migrate`", async () =>
        {
            await _seed();

            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "notes", migrate: (record, key) => [`note:${String(key)}`, record] }

            ], 2);

            expect(await database.get("notes", "note:todo")).toBe("Remember this");
            expect(await database.has("notes", "todo")).toBe(false);

            database.close();
        });
        it("Should delegate out-of-line keys to the generator when the tuple key is `undefined`", async () =>
        {
            const seeded = await _open();
            await seeded.put("logs", "First", 10);
            await seeded.put("logs", "Second", 20);
            seeded.close();

            const database = await IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "logs", autoIncrement: true, migrate: (record) => [undefined, record] }

            ], 2);

            expect(await database.getAll("logs")).toEqual(["First", "Second"]);
            expect(await database.has("logs", 10)).toBe(false);
            expect(await database.has("logs", 21)).toBe(true);

            database.close();
        });
        it("Should accept an asynchronous upgrade handler awaiting IndexedDB requests", async () =>
        {
            await _seed();

            const onUpgrade: UpgradeHandler = async (_database, _oldVersion, _newVersion, transaction) =>
            {
                const saves = await IndexedDatabase.Request(transaction.objectStore("saves").getAll());

                transaction.objectStore("notes").put(`${saves.length} saves`, "summary");
            };
            const database = await _open(2, onUpgrade);

            expect(await database.get("notes", "summary")).toBe("2 saves");

            database.close();
        });
        it("Should enforce the tuple returned by an out-of-line `migrate` at type level", () =>
        {
            const definitions: readonly StoreDefinition<keyof Stores>[] = [
                // @ts-expect-error An out-of-line store's `migrate` must return a `[key, value]` tuple.
                { name: "notes", migrate: (record) => ({ ...(record as object) }) }
            ];

            expect(definitions).toHaveLength(1);
        });

        it("Should reject with `DataError` when a record doesn't fit the new key path", async () =>
        {
            await _seed();

            await expect(IndexedDatabase.Open<MigratedStores>(DatabaseName, [{ name: "saves", keyPath: "id" }], 2))
                .rejects.toMatchObject({ name: "DataError" });

            const database = await _open();

            expect(database.version).toBe(1);
            expect(await database.getAll("saves")).toHaveLength(2);

            database.close();
        });
        it("Should reject with the thrown error when `migrate` throws", async () =>
        {
            await _seed();

            await expect(IndexedDatabase.Open<MigratedStores>(DatabaseName, [
                { name: "saves", keyPath: "id", migrate: () => { throw new Error("Nope."); } }

            ], 2)).rejects.toThrow("Nope.");

            const database = await _open();

            expect(database.version).toBe(1);

            database.close();
        });
        it("Should reject with the handler's error when an asynchronous upgrade handler rejects", async () =>
        {
            await _seed();

            await expect(_open(2, async () => { throw new Error("Nope."); }))
                .rejects.toThrow("Nope.");

            const database = await _open();

            expect(database.version).toBe(1);

            database.close();
        });
        it("Should reject with `DataError` when a delegated out-of-line key has no generator", async () =>
        {
            await _seed();

            await expect(IndexedDatabase.Open<Stores>(DatabaseName, [
                { name: "notes", migrate: (record) => [undefined, record] }

            ], 2)).rejects.toMatchObject({ name: "DataError" });

            const database = await _open();

            expect(database.version).toBe(1);
            expect(await database.get("notes", "todo")).toBe("Remember this");

            database.close();
        });
    });

    describe("Request", () =>
    {
        it("Should resolve with the request result", async () =>
        {
            const onUpgrade = vi.fn<UpgradeHandler>(async (_database, _oldVersion, _newVersion, transaction) =>
            {
                expect(await IndexedDatabase.Request(transaction.objectStore("saves").count())).toBe(0);
            });
            const database = await _open(1, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledTimes(1);

            database.close();
        });

        it("Should reject with the request error", async () =>
        {
            await expect(_open(1, async (_database, _oldVersion, _newVersion, transaction) =>
            {
                const store = transaction.objectStore("saves");
                store.add({ slot: 1, name: "First run" });

                await IndexedDatabase.Request(store.add({ slot: 1, name: "Duplicate" }));
            })).rejects.toMatchObject({ name: "ConstraintError" });
        });
    });

    describe("get", () =>
    {
        it("Should retrieve a stored record", async () =>
        {
            const database = await _open();
            await database.put("saves", { slot: 1, name: "First run" });

            expect(await database.get("saves", 1)).toEqual({ slot: 1, name: "First run" });

            database.close();
        });
        it("Should resolve `undefined` for a missing key", async () =>
        {
            const database = await _open();

            expect(await database.get("saves", 99)).toBeUndefined();

            database.close();
        });

        it("Should reject with `NotFoundError` for an unknown store", async () =>
        {
            const database = await _open();

            await expect(database.get("missing" as keyof Stores, 1))
                .rejects.toMatchObject({ name: "NotFoundError" });

            database.close();
        });
    });

    describe("getAll", () =>
    {
        it("Should retrieve all the records of a store", async () =>
        {
            const database = await _open();
            await database.put("saves", { slot: 2, name: "Second run" });
            await database.put("saves", { slot: 1, name: "First run" });

            expect(await database.getAll("saves")).toEqual([
                { slot: 1, name: "First run" },
                { slot: 2, name: "Second run" }
            ]);

            database.close();
        });
        it("Should resolve an empty array for an empty store", async () =>
        {
            const database = await _open();

            expect(await database.getAll("saves")).toEqual([]);

            database.close();
        });
    });

    describe("has", () =>
    {
        it("Should tell whether a record exists", async () =>
        {
            const database = await _open();
            await database.put("saves", { slot: 1, name: "First run" });

            expect(await database.has("saves", 1)).toBe(true);
            expect(await database.has("saves", 2)).toBe(false);

            database.close();
        });
    });

    describe("put", () =>
    {
        it("Should overwrite a record with the same key", async () =>
        {
            const database = await _open();
            await database.put("saves", { slot: 1, name: "First run" });
            await database.put("saves", { slot: 1, name: "Renamed" });

            expect(await database.getAll("saves")).toEqual([{ slot: 1, name: "Renamed" }]);

            database.close();
        });
        it("Should store a record with an explicit out-of-line key", async () =>
        {
            const database = await _open();
            await database.put("notes", "Remember this", "todo");

            expect(await database.get("notes", "todo")).toBe("Remember this");

            database.close();
        });
        it("Should let an auto-increment store generate the keys", async () =>
        {
            const database = await _open();
            await database.put("logs", "First");
            await database.put("logs", "Second");

            expect(await database.get("logs", 1)).toBe("First");
            expect(await database.get("logs", 2)).toBe("Second");

            database.close();
        });

        it("Should reject with `DataError` when providing a key for a store with a key path", async () =>
        {
            const database = await _open();

            await expect(database.put("saves", { slot: 1, name: "First run" }, 1))
                .rejects.toMatchObject({ name: "DataError" });

            database.close();
        });
    });

    describe("delete", () =>
    {
        it("Should remove a record", async () =>
        {
            const database = await _open();
            await database.put("saves", { slot: 1, name: "First run" });
            await database.delete("saves", 1);

            expect(await database.has("saves", 1)).toBe(false);

            database.close();
        });
        it("Should resolve even if the key doesn't exist", async () =>
        {
            const database = await _open();

            await expect(database.delete("saves", 99))
                .resolves.toBeUndefined();

            database.close();
        });
    });

    describe("clear", () =>
    {
        it("Should remove all the records of a store", async () =>
        {
            const database = await _open();
            await database.put("logs", "First");
            await database.put("logs", "Second");
            await database.clear("logs");

            expect(await database.getAll("logs")).toEqual([]);

            database.close();
        });
    });

    describe("close", () =>
    {
        it("Should reject any subsequent operation with `InvalidStateError`", async () =>
        {
            const database = await _open();
            database.close();

            await expect(database.get("saves", 1))
                .rejects.toMatchObject({ name: "InvalidStateError" });
        });
        it("Should be safe to call more than once", async () =>
        {
            const database = await _open();
            database.close();

            expect(() => database.close()).not.toThrow();
        });
        it("Should report whether the connection is open and fire the `close` event once", async () =>
        {
            const database = await _open();
            const onClose = vi.fn();

            database.onClose(onClose);

            expect(database.isOpen).toBe(true);

            database.close();
            database.close();

            expect(database.isOpen).toBe(false);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
        it("Should allow unsubscribing from the `close` event", async () =>
        {
            const database = await _open();
            const onClose = vi.fn();

            const unsubscribe = database.onClose(onClose);
            unsubscribe();

            database.close();

            expect(onClose).not.toHaveBeenCalled();
        });
        it("Should close itself and notify when another connection upgrades the database", async () =>
        {
            const first = await _open(1);
            const onClose = vi.fn();

            first.onClose(onClose);

            const second = await _open(2);

            expect(first.isOpen).toBe(false);
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(second.isOpen).toBe(true);

            await expect(first.get("saves", 1))
                .rejects.toMatchObject({ name: "InvalidStateError" });

            second.close();
        });
    });

    describe("Delete", () =>
    {
        it("Should delete the whole database", async () =>
        {
            const first = await _open();
            await first.put("saves", { slot: 1, name: "First run" });
            first.close();

            await IndexedDatabase.Delete(DatabaseName);

            const onUpgrade = vi.fn();
            const second = await _open(1, onUpgrade);

            expect(onUpgrade).toHaveBeenCalledWith(expect.any(Object), 0, 1, expect.any(Object));
            expect(await second.getAll("saves")).toEqual([]);

            second.close();
        });

        it("Should throw `EnvironmentException` if IndexedDB isn't supported", () =>
        {
            vi.stubGlobal("indexedDB", undefined);

            expect(() => IndexedDatabase.Delete(DatabaseName))
                .toThrow(EnvironmentException);
        });
        it("Should reject with `RuntimeException` when another connection blocks the deletion", async () =>
        {
            const raw = await _openRaw(1);

            await expect(IndexedDatabase.Delete(DatabaseName))
                .rejects.toThrow(RuntimeException);

            raw.close();
        });
    });
});
