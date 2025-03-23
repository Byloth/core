import { describe, expect, it, vi } from "vitest";

import { KeyException, NotImplementedException, RuntimeException } from "../../../src/index.js";
import { SwitchableCallback } from "../../../src/index.js";

interface Point
{
    x: number;
    y: number;
}

describe("SwitchableCallback", () =>
{
    const _newPoint = () =>
    {
        return {
            x: Math.floor(Math.random() * 1920),
            y: Math.floor(Math.random() * 1080)
        };
    };

    it("Should throw `NotImplementedException` if no callback is registered", () =>
    {
        const callback = new SwitchableCallback<(point: Point) => void>();

        expect(() => callback(_newPoint())).toThrow(NotImplementedException);
    });
    it("Should call the given callback as default", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });
        const result = _newPoint();

        const callback = new SwitchableCallback(_callback);

        callback(result);

        expect(callback.key).toBe("default");
        expect(_callback).toHaveBeenCalledWith(result);
    });

    it("Should register a new callback and set it as default", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });
        const result = _newPoint();

        const callback = new SwitchableCallback<(point: Point) => void>();
        callback.register("default", _callback);

        callback(result);

        expect(callback.key).toBe("default");
        expect(_callback).toHaveBeenCalledWith(result);
    });

    it("Should throw `KeyException` if trying to register a callback with an existing key", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback(_callback, "primary");
        callback.register("default", _callback);

        expect(() => callback.register("primary", _callback)).toThrow(KeyException);
        expect(() => callback.register("default", _callback)).toThrow(KeyException);
    });

    it("Should enable & disable the callback", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback(_callback);
        callback(_newPoint());

        expect(callback.isEnabled).toBe(true);

        callback.disable();
        callback(_newPoint());

        expect(callback.isEnabled).toBe(false);

        callback.enable();
        callback(_newPoint());

        expect(callback.isEnabled).toBe(true);
        expect(_callback).toHaveBeenCalledTimes(2);
    });
    it("Should disable & re-enable the callback with the given key", () =>
    {
        const _default = vi.fn((point: Point) => { /* ... */ });
        const _alternative = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback<(point: Point) => void>();
        callback.register("default", _default);
        callback.register("alternative", _alternative);
        callback(_newPoint());

        expect(callback.isEnabled).toBe(true);

        callback.disable();
        callback(_newPoint());

        expect(callback.isEnabled).toBe(false);

        callback.enable("alternative");
        callback(_newPoint());

        expect(callback.isEnabled).toBe(true);
        expect(_default).toHaveBeenCalledTimes(1);
        expect(_alternative).toHaveBeenCalledTimes(1);
    });

    it("Should throw `RuntimeException` if enabling an already enabled callback", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback<(point: Point) => void>();
        callback.register("default", _callback);

        expect(() => callback.enable()).toThrow(RuntimeException);
    });
    it("Should throw `RuntimeException` if enabling a non-existent callback", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback(_callback);
        callback.disable();

        expect(() => callback.enable("alternative")).toThrow(KeyException);
    });

    it("Should throw `RuntimeException` if disabling an already disabled callback", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback<(point: Point) => void>();
        callback.register("default", _callback);
        callback.disable();

        expect(() => callback.disable()).toThrow(RuntimeException);
    });

    it("Should switch to a different registered callback", () =>
    {
        const _callback1 = vi.fn((point: Point) => { /* ... */ });
        const _callback2 = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback<(point: Point) => void>();
        callback.register("first", _callback1);
        callback(_newPoint());

        expect(callback.key).toBe("first");

        callback.register("second", _callback2);
        callback(_newPoint());

        expect(callback.key).toBe("first");

        callback.switch("second");
        callback(_newPoint());

        expect(callback.key).toBe("second");
        expect(_callback1).toHaveBeenCalledTimes(2);
        expect(_callback2).toHaveBeenCalledTimes(1);
    });

    it("Should throw `KeyException` if switching to a non-existent callback", () =>
    {
        const callback = new SwitchableCallback<(point: Point) => void>();

        expect(() => callback.switch("nonexistent")).toThrow(KeyException);
    });

    it("Should unregister a callback", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback(_callback);
        callback.register("second", _callback);

        callback.switch("second");
        callback.unregister("default");

        expect(() => callback.switch("default")).toThrow(KeyException);
    });

    it("Should throw `KeyException` if unregistering the currently selected callback", () =>
    {
        const _callback = vi.fn((point: Point) => { /* ... */ });

        const callback = new SwitchableCallback<(point: Point) => void>();
        callback.register("default", _callback);

        expect(() => callback.unregister("default")).toThrow(KeyException);
    });

    it("Should throw `KeyException` if unregistering a non-existent callback", () =>
    {
        const callback = new SwitchableCallback<(point: Point) => void>();

        expect(() => callback.unregister("nonexistent")).toThrow(KeyException);
    });
});
