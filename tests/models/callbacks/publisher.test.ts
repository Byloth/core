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

    it("Should not throw `ReferenceException` when unsubscribing a non-existent subscriber", () =>
    {
        const _moveHandler = vi.fn();

        expect(() => publisher.unsubscribe("player:move", _moveHandler)).not.toThrow(ReferenceException);
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
});
