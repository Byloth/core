import { beforeEach, describe, it, expect, vi } from "vitest";
import type { Mock } from "vitest";

import { ArrayView } from "../../../src/index.js";

describe("ArrayView", () =>
{
    let callback: Mock;
    let arrayView: ArrayView<number>;

    beforeEach(() =>
    {
        callback = vi.fn();
        arrayView = new ArrayView<number>(2, 4, 8);
    });

    it("Should initialize an empty array", () =>
    {
        const empty = new ArrayView<number>();

        expect(empty.length).toBe(0);
    });
    it("Should initialize an array with items", () =>
    {
        expect(arrayView.length).toBe(3);
        expect(arrayView[0]).toBe(2);
        expect(arrayView[1]).toBe(4);
        expect(arrayView[2]).toBe(8);
    });

    it("Should push elements and publish 'add' events", () =>
    {
        arrayView.onAdd(callback);
        expect(arrayView.length).toBe(3);

        const newLength = arrayView.push(16, 32);
        expect(newLength).toBe(5);
        expect(arrayView.length).toBe(5);
        expect(arrayView[3]).toBe(16);
        expect(arrayView[4]).toBe(32);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(16, 3);
        expect(callback).toHaveBeenCalledWith(32, 4);
    });

    it("Should pop an element and publish a 'remove' event", () =>
    {
        arrayView.onRemove(callback);
        expect(arrayView.length).toBe(3);

        const value = arrayView.pop();
        expect(value).toBe(8);
        expect(arrayView.length).toBe(2);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(8, 2);
    });
    it("Should return undefined when popping from an empty array", () =>
    {
        const empty = new ArrayView<number>();
        empty.onRemove(callback);

        const value = empty.pop();
        expect(value).toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
    });

    it("Should shift an element and publish a 'remove' event", () =>
    {
        arrayView.onRemove(callback);
        expect(arrayView.length).toBe(3);

        const value = arrayView.shift();
        expect(value).toBe(2);
        expect(arrayView.length).toBe(2);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(2, 0);
    });
    it("Should return undefined when shifting from an empty array", () =>
    {
        const empty = new ArrayView<number>();
        empty.onRemove(callback);

        const value = empty.shift();
        expect(value).toBeUndefined();
        expect(callback).not.toHaveBeenCalled();
    });

    it("Should unshift elements and publish 'add' events", () =>
    {
        arrayView.onAdd(callback);
        expect(arrayView.length).toBe(3);

        const newLength = arrayView.unshift(0, 1);
        expect(newLength).toBe(5);
        expect(arrayView.length).toBe(5);
        expect(arrayView[0]).toBe(0);
        expect(arrayView[1]).toBe(1);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(0, 0);
        expect(callback).toHaveBeenCalledWith(1, 1);
    });

    it("Should splice elements and publish 'remove' and 'add' events", () =>
    {
        const addCallback = vi.fn();
        const removeCallback = vi.fn();

        arrayView.onAdd(addCallback);
        arrayView.onRemove(removeCallback);

        const removed = arrayView.splice(1, 2, 32, 64);
        expect(removed).toEqual([4, 8]);
        expect(arrayView.length).toBe(3);
        expect(arrayView[0]).toBe(2);
        expect(arrayView[1]).toBe(32);
        expect(arrayView[2]).toBe(64);

        expect(removeCallback).toHaveBeenCalledTimes(2);
        expect(removeCallback).toHaveBeenCalledWith(4, 1);
        expect(removeCallback).toHaveBeenCalledWith(8, 2);

        expect(addCallback).toHaveBeenCalledTimes(2);
        expect(addCallback).toHaveBeenCalledWith(32, 1);
        expect(addCallback).toHaveBeenCalledWith(64, 2);
    });
    it("Should splice with negative start index", () =>
    {
        arrayView.onRemove(callback);

        const removed = arrayView.splice(-1, 1);
        expect(removed).toEqual([8]);
        expect(arrayView.length).toBe(2);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(8, 2);
    });
    it("Should splice without deleteCount removing all remaining elements", () =>
    {
        arrayView.onRemove(callback);

        const removed = arrayView.splice(1);
        expect(removed).toEqual([4, 8]);
        expect(arrayView.length).toBe(1);
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it("Should clear all elements and publish a 'clear' event", () =>
    {
        arrayView.onClear(callback);
        expect(arrayView.length).toBe(3);

        arrayView.clear();
        expect(arrayView.length).toBe(0);
        expect(callback).toHaveBeenCalledTimes(1);
    });
    it("Should not publish 'clear' event if array is already empty", () =>
    {
        const empty = new ArrayView<number>();
        empty.onClear(callback);

        empty.clear();
        expect(callback).not.toHaveBeenCalled();
    });

    it("Should unsubscribe from an event", () =>
    {
        expect(arrayView.length).toBe(3);

        const unsubscribeAdd = arrayView.onAdd(callback);
        unsubscribeAdd();

        arrayView.push(16);
        expect(arrayView.length).toBe(4);
        expect(arrayView[3]).toBe(16);
        expect(callback).not.toHaveBeenCalled();

        const unsubscribeRemove = arrayView.onRemove(callback);
        unsubscribeRemove();

        arrayView.pop();
        expect(arrayView.length).toBe(3);
        expect(callback).not.toHaveBeenCalled();
    });
    it("Should handle multiple subscriptions for the same event", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        arrayView.onAdd(_callback1);
        arrayView.onAdd(_callback2);

        expect(arrayView.length).toBe(3);

        arrayView.push(16);
        expect(arrayView.length).toBe(4);
        expect(arrayView[3]).toBe(16);

        expect(_callback1).toHaveBeenCalledTimes(1);
        expect(_callback1).toHaveBeenCalledWith(16, 3);

        expect(_callback2).toHaveBeenCalledTimes(1);
        expect(_callback2).toHaveBeenCalledWith(16, 3);
    });
});
