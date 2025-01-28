import { beforeEach, describe, expect, it, vi } from "vitest";

import * as helpers from "../../../src/helpers.js";

import { EnvironmentException } from "../../../src/index.js";
import { JSONStorage } from "../../../src/index.js";

describe("JSONStorage", () =>
{
    let jsonStorage: JSONStorage;

    beforeEach(() =>
    {
        vi.spyOn(helpers, "isBrowser", "get")
            .mockReturnValue(true);

        const mockStorage = () =>
        {
            let store: Record<string, string> = { };

            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => { store[key] = value; },

                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                removeItem: (key: string) => delete store[key],
                clear: () => { store = { }; }
            };
        };

        Object.defineProperty(window, "localStorage", { value: mockStorage() });
        Object.defineProperty(window, "sessionStorage", { value: mockStorage() });

        jsonStorage = new JSONStorage();
    });

    it("Should throw an EnvironmentException if not in a browser environment", () =>
    {
        vi.spyOn(helpers, "isBrowser", "get")
            .mockReturnValue(false);

        expect(() => new JSONStorage()).toThrow(EnvironmentException);
    });

    it("Should store and retrieve a value in `localStorage`", () =>
    {
        const key = "testKey";
        const value = { test: "value" };

        jsonStorage.write(key, value);

        const retrievedValue = jsonStorage.read(key);
        expect(retrievedValue).toEqual(value);
    });
    it("Should store and retrieve a value in `sessionStorage`", () =>
    {
        const key = "testKey";
        const value = { test: "value" };

        jsonStorage.remember(key, value);

        const retrievedValue = jsonStorage.recall(key);
        expect(retrievedValue).toEqual(value);
    });

    it("Should remove a value from `localStorage`", () =>
    {
        const key = "testKey";
        const value = { test: "value" };

        jsonStorage.write(key, value);
        jsonStorage.erase(key);

        const retrievedValue = jsonStorage.read(key);
        expect(retrievedValue).toBeUndefined();
    });
    it("Should remove a value from `sessionStorage`", () =>
    {
        const key = "testKey";
        const value = { test: "value" };

        jsonStorage.remember(key, value);
        jsonStorage.forget(key);

        const retrievedValue = jsonStorage.recall(key);
        expect(retrievedValue).toBeUndefined();
    });

    it("Should prefer `localStorage` over `sessionStorage` when retrieving a value", () =>
    {
        const key = "testKey";
        const localStorageValue = { test: "localStorageValue" };
        const sessionStorageValue = { test: "sessionStorageValue" };

        jsonStorage.write(key, localStorageValue);
        jsonStorage.remember(key, sessionStorageValue);

        const retrievedValue = jsonStorage.get(key);
        expect(retrievedValue).toEqual(localStorageValue);
    });

    it("Should check if a key exists in `localStorage`", () =>
    {
        const key = "testKey";
        const value = { test: "value" };

        jsonStorage.write(key, value);

        const exists = jsonStorage.exists(key);
        expect(exists).toBe(true);
    });
    it("Should check if a key exists in `sessionStorage`", () =>
    {
        const key = "testKey";
        const value = { test: "value" };

        jsonStorage.remember(key, value);
        const exists = jsonStorage.knows(key);

        expect(exists).toBe(true);
    });

    it("Should clear a key from both `localStorage` and `sessionStorage`", () =>
    {
        const key = "testKey";
        const value = { test: "value" };

        jsonStorage.write(key, value);
        jsonStorage.remember(key, value);
        jsonStorage.clear(key);

        const localStorageValue = jsonStorage.read(key);
        const sessionStorageValue = jsonStorage.recall(key);

        expect(localStorageValue).toBeUndefined();
        expect(sessionStorageValue).toBeUndefined();
    });
});
