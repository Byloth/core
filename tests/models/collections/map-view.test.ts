import { beforeEach, describe, it, expect, vi } from "vitest";
import type { Mock } from "vitest";

import { MapView } from "../../../src/index.js";

describe("MapView", () =>
{
    let callback: Mock;
    let mapView: MapView<string, number>;

    beforeEach(() =>
    {
        callback = vi.fn();
        mapView = new MapView<string, number>([["key1", 0], ["key2", 1], ["key3", 2]]);
    });

    it("Should set an entry and publish a 'entry:add' event", () =>
    {
        mapView.onAdd(callback);
        expect(mapView.size).toBe(3);
        expect(mapView.has("answer")).toBe(false);

        mapView.set("answer", 42);
        expect(mapView.size).toBe(4);
        expect(mapView.get("answer")).toBe(42);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("answer", 42);
    });

    it("Should delete an entry and publish a 'entry:remove' event", () =>
    {
        mapView.onRemove(callback);
        expect(mapView.size).toBe(3);
        expect(mapView.get("key1")).toBe(0);

        const result = mapView.delete("key1");
        expect(result).toBe(true);
        expect(mapView.size).toBe(2);
        expect(mapView.has("key1")).toBe(false);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("key1", 0);
    });
    it("Should not publish 'entry:remove' event if entry doesn't exist", () =>
    {
        mapView.onRemove(callback);
        expect(mapView.size).toBe(3);
        expect(mapView.has("answer")).toBe(false);

        const result = mapView.delete("answer");
        expect(result).toBe(false);
        expect(callback).not.toHaveBeenCalled();
    });

    it("Should clear all entries and publish a 'collection:clear' event", () =>
    {
        mapView.onClear(callback);
        expect(mapView.size).toBe(3);

        mapView.clear();
        expect(mapView.size).toBe(0);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("Should unsubscribe from an event", () =>
    {
        expect(mapView.size).toBe(3);
        expect(mapView.has("answer")).toBe(false);

        const unsubscribeAdd = mapView.onAdd(callback);
        unsubscribeAdd();

        mapView.set("answer", 42);
        expect(mapView.size).toBe(4);
        expect(mapView.get("answer")).toBe(42);
        expect(callback).not.toHaveBeenCalled();

        const unsubscribeRemove = mapView.onRemove(callback);
        unsubscribeRemove();

        mapView.delete("answer");
        expect(mapView.has("answer")).toBe(false);
        expect(callback).not.toHaveBeenCalled();
    });
    it("Should handle multiple subscriptions for the same event", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        mapView.onAdd(_callback1);
        mapView.onAdd(_callback2);

        expect(mapView.size).toBe(3);
        expect(mapView.has("answer")).toBe(false);

        mapView.set("answer", 42);
        expect(mapView.size).toBe(4);
        expect(mapView.get("answer")).toBe(42);

        expect(_callback1).toHaveBeenCalledTimes(1);
        expect(_callback1).toHaveBeenCalledWith("answer", 42);

        expect(_callback2).toHaveBeenCalledTimes(1);
        expect(_callback2).toHaveBeenCalledWith("answer", 42);
    });
});
