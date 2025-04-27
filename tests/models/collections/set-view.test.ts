import { beforeEach, describe, it, expect, vi } from "vitest";
import type { Mock } from "vitest";

import { SetView } from "../../../src/index.js";

describe("SetView", () =>
{
    let callback: Mock;
    let setView: SetView<number>;

    beforeEach(() =>
    {
        callback = vi.fn();
        setView = new SetView<number>([0, 1, 2]);
    });

    it("Should set an entry and publish a 'entry:add' event", () =>
    {
        setView.subscribe("entry:add", callback);
        expect(setView.size).toBe(3);
        expect(setView.has(42)).toBe(false);

        setView.add(42);
        expect(setView.size).toBe(4);
        expect(setView.has(42)).toBe(true);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(42);
    });

    it("Should delete an entry and publish a 'entry:remove' event", () =>
    {
        setView.subscribe("entry:remove", callback);
        expect(setView.size).toBe(3);
        expect(setView.has(0)).toBe(true);

        const result = setView.delete(0);
        expect(result).toBe(true);
        expect(setView.size).toBe(2);
        expect(setView.has(0)).toBe(false);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(0);
    });
    it("Should not publish 'entry:remove' event if entry doesn't exist", () =>
    {
        setView.subscribe("entry:remove", callback);
        expect(setView.size).toBe(3);
        expect(setView.has(42)).toBe(false);

        const result = setView.delete(42);
        expect(result).toBe(false);
        expect(callback).not.toHaveBeenCalled();
    });

    it("Should clear all entries and publish a 'collection:clear' event", () =>
    {
        setView.subscribe("collection:clear", callback);
        expect(setView.size).toBe(3);

        setView.clear();
        expect(setView.size).toBe(0);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it("Should unsubscribe from an event", () =>
    {
        expect(setView.size).toBe(3);
        expect(setView.has(42)).toBe(false);

        const unsubscribe = setView.subscribe("entry:add", callback);
        unsubscribe();

        setView.add(42);
        expect(setView.size).toBe(4);
        expect(setView.has(42)).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        setView.subscribe("entry:remove", callback);
        setView.unsubscribe("entry:remove", callback);

        setView.delete(42);
        expect(setView.has(42)).toBe(false);
        expect(callback).not.toHaveBeenCalled();
    });
    it("Should handle multiple subscriptions for the same event", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        setView.subscribe("entry:add", _callback1);
        setView.subscribe("entry:add", _callback2);

        expect(setView.size).toBe(3);
        expect(setView.has(42)).toBe(false);

        setView.add(42);
        expect(setView.size).toBe(4);
        expect(setView.has(42)).toBe(true);

        expect(_callback1).toHaveBeenCalledTimes(1);
        expect(_callback1).toHaveBeenCalledWith(42);

        expect(_callback2).toHaveBeenCalledTimes(1);
        expect(_callback2).toHaveBeenCalledWith(42);
    });
});
