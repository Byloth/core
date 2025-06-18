import { beforeEach, describe, expect, it, vi } from "vitest";

import { Publisher, ReferenceException } from "../../../src/index.js";

interface EventsMap
{
    "player:spawn": (evt: { x: number, y: number }) => void;
    "player:move": (coords: { x: number, y: number }) => void;
    "player:death": () => void;
}

describe("Publisher", () =>
{
    let publisher: Publisher<EventsMap>;
    beforeEach(() => { publisher = new Publisher<EventsMap>(); });

    it("Should subscribe and publish events", () =>
    {
        const _spawnHandler = vi.fn();
        const _moveHandler = vi.fn();

        publisher.subscribe("player:spawn", _spawnHandler);
        publisher.subscribe("player:move", _moveHandler);

        publisher.publish("player:spawn", { x: 10, y: 20 });
        publisher.publish("player:move", { x: 30, y: 40 });

        expect(_spawnHandler).toHaveBeenCalledWith({ x: 10, y: 20 });
        expect(_moveHandler).toHaveBeenCalledWith({ x: 30, y: 40 });
    });

    it("Should unsubscribe from events", () =>
    {
        const _moveHandler = vi.fn();
        const unsubscribe = publisher.subscribe("player:move", _moveHandler);

        unsubscribe();
        expect(() => unsubscribe()).toThrow(ReferenceException);

        publisher.publish("player:move", { x: 30, y: 40 });

        expect(_moveHandler).not.toHaveBeenCalled();
    });

    it("Should clear all subscribers", () =>
    {
        const _spawnHandler = vi.fn();
        const _moveHandler = vi.fn();
        const _deathHandler = vi.fn();

        publisher.subscribe("player:spawn", _spawnHandler);
        publisher.subscribe("player:move", _moveHandler);
        publisher.subscribe("player:death", _deathHandler);

        publisher.clear();

        publisher.publish("player:spawn", { x: 10, y: 20 });
        publisher.publish("player:move", { x: 30, y: 40 });
        publisher.publish("player:death");

        expect(_spawnHandler).not.toHaveBeenCalled();
        expect(_moveHandler).not.toHaveBeenCalled();
        expect(_deathHandler).not.toHaveBeenCalled();
    });

    it("Should not throw `ReferenceException` when unsubscribing from an event that does not exist", () =>
    {
        const _moveHandler = vi.fn();
        const _spawnHandler = vi.fn();

        publisher.subscribe("player:move", _moveHandler);
        expect(() => publisher.unsubscribe("player:spawn", _spawnHandler)).toThrow(ReferenceException);
    });
    it("Should throw `ReferenceException` when unsubscribing a subscriber that was not subscribed", () =>
    {
        const _moveHandler = vi.fn();
        const _spawnHandler1 = vi.fn();
        const _spawnHandler2 = vi.fn();

        publisher.subscribe("player:move", _moveHandler);
        publisher.subscribe("player:spawn", _spawnHandler1);
        expect(() => publisher.unsubscribe("player:move", _spawnHandler2)).toThrow(ReferenceException);
    });

    it("Should return an array of return values from subscribers", () =>
    {
        const _moveHandler1 = vi.fn(() => "handler1");
        const _moveHandler2 = vi.fn(() => "handler2");

        publisher.subscribe("player:move", _moveHandler1);
        publisher.subscribe("player:move", _moveHandler2);

        const results = publisher.publish("player:move", { x: 30, y: 40 });
        expect(results).toEqual(["handler1", "handler2"]);
    });

    it("Should listen to all events with wildcard", () =>
    {
        const _spawnHandler = vi.fn();
        const _moveHandler = vi.fn();
        const _wildcardHandler = vi.fn();

        publisher.subscribe("player:spawn", _spawnHandler);
        publisher.subscribe("player:move", _moveHandler);
        publisher.subscribe("*", _wildcardHandler);

        publisher.publish("player:spawn", { x: 10, y: 20 });

        publisher.publish("player:move", { x: 30, y: 40 });
        publisher.publish("player:move", { x: 50, y: 60 });

        publisher.publish("player:death");

        expect(_spawnHandler).toBeCalledTimes(1);
        expect(_moveHandler).toBeCalledTimes(2);
        expect(_wildcardHandler).toBeCalledTimes(4);
    });

    it("Shouldn't call wildcard subscribers for internal events", () =>
    {
        const _internalHandler = vi.fn();
        const _wildcardHandler = vi.fn();

        publisher.subscribe("__wildcard__:test", _internalHandler);
        publisher.subscribe("*", _wildcardHandler);

        publisher.publish("__wildcard__:test");

        expect(_internalHandler).toHaveBeenCalled();
        expect(_wildcardHandler).not.toHaveBeenCalled();
    });

    it("Should propagate events to a scoped publisher", () =>
    {
        const _moveHandler = vi.fn();
        const _spawnHandler = vi.fn();

        const scope = publisher.createScope();

        scope.subscribe("player:move", _moveHandler);
        scope.subscribe("player:spawn", _spawnHandler);

        publisher.publish("player:move", { x: 1, y: 2 });
        publisher.publish("player:spawn", { x: 3, y: 4 });

        expect(_moveHandler).toHaveBeenCalledWith({ x: 1, y: 2 });
        expect(_spawnHandler).toHaveBeenCalledWith({ x: 3, y: 4 });
    });

    it("Should clear scoped publisher when parent is cleared", () =>
    {
        const _moveHandler = vi.fn();

        const scope = publisher.createScope();
        scope.subscribe("player:move", _moveHandler);

        publisher.clear();

        scope.publish("player:move", { x: 10, y: 20 });

        expect(_moveHandler).not.toHaveBeenCalled();
    });
});
