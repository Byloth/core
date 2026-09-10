import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EventEmitter, ReferenceException, TimeoutException } from "../../../src/index.js";

interface EventsMap
{
    "player:spawn": (evt: { x: number, y: number }) => void;
    "player:move": (coords: { x: number, y: number }) => void;
    "player:death": () => void;
}

describe("EventEmitter", () =>
{
    let emitter: EventEmitter<EventsMap>;
    beforeEach(() => { emitter = new EventEmitter<EventsMap>(); });

    it("Should attach listeners and emit events", () =>
    {
        const _spawnHandler = vi.fn();
        const _moveHandler = vi.fn();

        emitter.on("player:spawn", _spawnHandler);
        emitter.on("player:move", _moveHandler);

        emitter.emit("player:spawn", { x: 10, y: 20 });
        emitter.emit("player:move", { x: 30, y: 40 });

        expect(_spawnHandler).toHaveBeenCalledWith({ x: 10, y: 20 });
        expect(_moveHandler).toHaveBeenCalledWith({ x: 30, y: 40 });
    });

    it("Should detach a listener through the returned handle", () =>
    {
        const _moveHandler = vi.fn();
        const unsubscribe = emitter.on("player:move", _moveHandler);

        unsubscribe();
        expect(() => unsubscribe()).toThrow(ReferenceException);

        emitter.emit("player:move", { x: 30, y: 40 });

        expect(_moveHandler).not.toHaveBeenCalled();
    });
    it("Should detach a listener through `off`", () =>
    {
        const _moveHandler = vi.fn();

        emitter.on("player:move", _moveHandler);
        emitter.off("player:move", _moveHandler);

        emitter.emit("player:move", { x: 30, y: 40 });

        expect(_moveHandler).not.toHaveBeenCalled();
        expect(emitter["_listeners"].has("player:move")).toBe(false);
    });

    it("Should detach all the listeners of a specific event", () =>
    {
        const _spawnHandler = vi.fn();
        const _moveHandler1 = vi.fn();
        const _moveHandler2 = vi.fn();
        const _deathHandler = vi.fn();

        emitter.on("player:spawn", _spawnHandler);
        emitter.on("player:move", _moveHandler1);
        emitter.on("player:move", _moveHandler2);
        emitter.on("player:death", _deathHandler);

        emitter.off("player:move");

        emitter.emit("player:spawn", { x: 10, y: 20 });
        emitter.emit("player:move", { x: 30, y: 40 });
        emitter.emit("player:death");

        expect(_spawnHandler).toHaveBeenCalledTimes(1);
        expect(_moveHandler1).not.toHaveBeenCalled();
        expect(_moveHandler2).not.toHaveBeenCalled();
        expect(_deathHandler).toHaveBeenCalledTimes(1);
    });
    it("Should throw when detaching all the listeners of an event that has none", () =>
    {
        expect(() => emitter.off("player:move")).toThrow(ReferenceException);

        const unsubscribe = emitter.on("player:move", vi.fn());
        unsubscribe();

        expect(() => emitter.off("player:move")).toThrow(ReferenceException);
    });
    it("Should detach all the listeners", () =>
    {
        const _spawnHandler = vi.fn();
        const _moveHandler = vi.fn();
        const _deathHandler = vi.fn();

        emitter.on("player:spawn", _spawnHandler);
        emitter.on("player:move", _moveHandler);
        emitter.on("player:death", _deathHandler);

        emitter.clear();

        emitter.emit("player:spawn", { x: 10, y: 20 });
        emitter.emit("player:move", { x: 30, y: 40 });
        emitter.emit("player:death");

        expect(_spawnHandler).not.toHaveBeenCalled();
        expect(_moveHandler).not.toHaveBeenCalled();
        expect(_deathHandler).not.toHaveBeenCalled();
    });

    it("Should throw `ReferenceException` when detaching from an event that has no listeners", () =>
    {
        const _moveHandler = vi.fn();
        const _spawnHandler = vi.fn();

        emitter.on("player:move", _moveHandler);
        expect(() => emitter.off("player:spawn", _spawnHandler)).toThrow(ReferenceException);
    });
    it("Should throw `ReferenceException` when detaching a listener that was never attached", () =>
    {
        const _moveHandler = vi.fn();
        const _spawnHandler1 = vi.fn();
        const _spawnHandler2 = vi.fn();

        emitter.on("player:move", _moveHandler);
        emitter.on("player:spawn", _spawnHandler1);
        expect(() => emitter.off("player:move", _spawnHandler2)).toThrow(ReferenceException);
    });

    it("Should return an array of return values from the listeners", () =>
    {
        const _moveHandler1 = vi.fn(() => "handler1");
        const _moveHandler2 = vi.fn(() => "handler2");

        emitter.on("player:move", _moveHandler1);
        emitter.on("player:move", _moveHandler2);

        const results = emitter.emit("player:move", { x: 30, y: 40 });
        expect(results).toEqual(["handler1", "handler2"]);
    });

    it("Should listen to all events with the wildcard", () =>
    {
        const _spawnHandler = vi.fn();
        const _moveHandler = vi.fn();
        const _wildcardHandler = vi.fn();

        emitter.on("player:spawn", _spawnHandler);
        emitter.on("player:move", _moveHandler);
        emitter.on("*", _wildcardHandler);

        emitter.emit("player:spawn", { x: 10, y: 20 });

        emitter.emit("player:move", { x: 30, y: 40 });
        emitter.emit("player:move", { x: 50, y: 60 });

        emitter.emit("player:death");

        expect(_spawnHandler).toBeCalledTimes(1);
        expect(_moveHandler).toBeCalledTimes(2);
        expect(_wildcardHandler).toBeCalledTimes(4);
    });
    it("Shouldn't call the wildcard listeners for internal events", () =>
    {
        const _internalHandler = vi.fn();
        const _wildcardHandler = vi.fn();

        emitter.on("__wildcard__:test", _internalHandler);
        emitter.on("*", _wildcardHandler);

        emitter.emit("__wildcard__:test");

        expect(_internalHandler).toHaveBeenCalled();
        expect(_wildcardHandler).not.toHaveBeenCalled();
    });

    it("Should propagate events to a scoped emitter", () =>
    {
        const _moveHandler = vi.fn();
        const _spawnHandler = vi.fn();

        const scope = emitter.createScope();

        scope.on("player:move", _moveHandler);
        scope.on("player:spawn", _spawnHandler);

        emitter.emit("player:move", { x: 1, y: 2 });
        emitter.emit("player:spawn", { x: 3, y: 4 });

        expect(_moveHandler).toHaveBeenCalledWith({ x: 1, y: 2 });
        expect(_spawnHandler).toHaveBeenCalledWith({ x: 3, y: 4 });
    });
    it("Should clear a scoped emitter when the parent is cleared", () =>
    {
        const _moveHandler = vi.fn();

        const scope = emitter.createScope();
        scope.on("player:move", _moveHandler);

        emitter.clear();

        scope.emit("player:move", { x: 10, y: 20 });

        expect(_moveHandler).not.toHaveBeenCalled();
    });

    describe("once", () =>
    {
        it("Should execute the listener only the first time the event is emitted", () =>
        {
            const _moveHandler = vi.fn();

            emitter.once("player:move", _moveHandler);

            emitter.emit("player:move", { x: 1, y: 2 });
            emitter.emit("player:move", { x: 3, y: 4 });

            expect(_moveHandler).toHaveBeenCalledTimes(1);
            expect(_moveHandler).toHaveBeenCalledWith({ x: 1, y: 2 });
        });
        it("Should forget the listener as soon as it fires", () =>
        {
            emitter.once("player:move", vi.fn());
            emitter.emit("player:move", { x: 1, y: 2 });

            expect(emitter["_wrappers"].size).toBe(0);
            expect(emitter["_listeners"].get("player:move")).toEqual([]);
        });
        it("Should allow the listener to re-attach itself while firing", () =>
        {
            const _moveHandler = vi.fn(() => { emitter.once("player:move", _moveHandler); });

            emitter.once("player:move", _moveHandler);

            emitter.emit("player:move", { x: 1, y: 2 });
            emitter.emit("player:move", { x: 3, y: 4 });

            expect(_moveHandler).toHaveBeenCalledTimes(2);
        });

        it("Should detach the listener through the handle before it fires", () =>
        {
            const _moveHandler = vi.fn();

            const unsubscribe = emitter.once("player:move", _moveHandler);
            unsubscribe();

            emitter.emit("player:move", { x: 1, y: 2 });

            expect(_moveHandler).not.toHaveBeenCalled();
            expect(emitter["_wrappers"].size).toBe(0);
        });
        it("Should tolerate the handle being called once after the listener has fired", () =>
        {
            const unsubscribe = emitter.once("player:move", vi.fn());
            emitter.emit("player:move", { x: 1, y: 2 });

            expect(() => unsubscribe()).not.toThrow();
        });
        it("Should throw when the handle is called twice", () =>
        {
            const unsubscribe1 = emitter.once("player:move", vi.fn());
            emitter.emit("player:move", { x: 1, y: 2 });

            unsubscribe1();
            expect(() => unsubscribe1()).toThrow(ReferenceException);

            const unsubscribe2 = emitter.once("player:spawn", vi.fn());

            unsubscribe2();
            expect(() => unsubscribe2()).toThrow(ReferenceException);
        });

        it("Should detach the listener through `off` before it fires", () =>
        {
            const _moveHandler = vi.fn();

            emitter.once("player:move", _moveHandler);
            emitter.off("player:move", _moveHandler);

            emitter.emit("player:move", { x: 1, y: 2 });

            expect(_moveHandler).not.toHaveBeenCalled();
            expect(emitter["_wrappers"].size).toBe(0);
            expect(emitter["_listeners"].has("player:move")).toBe(false);
        });
        it("Should throw when detaching through `off` a listener that has already fired", () =>
        {
            const _moveHandler = vi.fn();

            emitter.once("player:move", _moveHandler);
            emitter.emit("player:move", { x: 1, y: 2 });

            expect(() => emitter.off("player:move", _moveHandler)).toThrow(ReferenceException);
        });
        it("Should throw when the handle is called after `off` detached the listener", () =>
        {
            const _moveHandler = vi.fn();

            const unsubscribe = emitter.once("player:move", _moveHandler);
            emitter.off("player:move", _moveHandler);

            expect(() => unsubscribe()).toThrow(ReferenceException);
        });

        it("Should throw when attaching the same listener once to the same event twice", () =>
        {
            const _moveHandler = vi.fn();

            emitter.once("player:move", _moveHandler);

            expect(() => emitter.once("player:move", _moveHandler)).toThrow(ReferenceException);
        });
        it("Should keep one-time listeners of other events when detaching all the listeners of one", () =>
        {
            const _moveHandler = vi.fn();
            const _spawnHandler = vi.fn();

            emitter.once("player:move", _moveHandler);
            emitter.once("player:spawn", _spawnHandler);

            emitter.off("player:move");

            emitter.emit("player:move", { x: 1, y: 2 });
            emitter.emit("player:spawn", { x: 3, y: 4 });

            expect(_moveHandler).not.toHaveBeenCalled();
            expect(_spawnHandler).toHaveBeenCalledTimes(1);
            expect(emitter["_wrappers"].size).toBe(0);
        });
        it("Should forget every one-time listener when cleared", () =>
        {
            const _moveHandler = vi.fn();

            emitter.once("player:move", _moveHandler);
            emitter.clear();

            emitter.emit("player:move", { x: 1, y: 2 });

            expect(_moveHandler).not.toHaveBeenCalled();
            expect(emitter["_wrappers"].size).toBe(0);
        });

        it("Should listen to the next event only with the wildcard", () =>
        {
            const _wildcardHandler = vi.fn();

            emitter.once("*", _wildcardHandler);

            emitter.emit("player:move", { x: 1, y: 2 });
            emitter.emit("player:death");

            expect(_wildcardHandler).toHaveBeenCalledTimes(1);
            expect(_wildcardHandler).toHaveBeenCalledWith("player:move", { x: 1, y: 2 });
        });
    });

    describe("wait", () =>
    {
        beforeEach(() => { vi.useFakeTimers(); });
        afterEach(() => { vi.useRealTimers(); });

        it("Should resolve with the arguments of the next emission", async () =>
        {
            const promise = emitter.wait("player:move");

            emitter.emit("player:move", { x: 1, y: 2 });
            emitter.emit("player:move", { x: 3, y: 4 });

            await expect(promise).resolves.toEqual([{ x: 1, y: 2 }]);
        });
        it("Should detach its listener once resolved", async () =>
        {
            const promise = emitter.wait("player:death");

            expect(emitter["_listeners"].get("player:death")).toHaveLength(1);

            emitter.emit("player:death");
            await promise;

            expect(emitter["_listeners"].get("player:death")).toEqual([]);
        });

        it("Should reject with `TimeoutException` when the event isn't emitted in time", async () =>
        {
            const promise = emitter.wait("player:spawn", 100);
            const expectation = expect(promise).rejects.toThrow(TimeoutException);

            vi.advanceTimersByTime(100);

            await expectation;
            expect(emitter["_listeners"].get("player:spawn")).toEqual([]);
        });
        it("Should resolve before the timeout when the event is emitted", async () =>
        {
            const promise = emitter.wait("player:spawn", 100);

            vi.advanceTimersByTime(50);
            emitter.emit("player:spawn", { x: 1, y: 2 });

            await expect(promise).resolves.toEqual([{ x: 1, y: 2 }]);
        });

        it("Should resolve with the type and the arguments of the next event with the wildcard", async () =>
        {
            const promise = emitter.wait("*");

            emitter.emit("player:move", { x: 1, y: 2 });

            await expect(promise).resolves.toEqual(["player:move", { x: 1, y: 2 }]);
        });
    });
});
