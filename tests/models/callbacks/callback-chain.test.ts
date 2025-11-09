import { describe, it, expect, vi } from "vitest";
import { CallbackChain } from "../../../src/index.js";

describe("CallbackChain", () =>
{
    it("Should initialize with no provided callbacks", () =>
    {
        const chain = new CallbackChain();

        expect(chain.size).toBe(0);
    });
    it("Should initialize with provided callbacks", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        const chain = new CallbackChain(_callback1, _callback2);
        expect(chain.size).toBe(2);

        chain();
        expect(_callback1).toBeCalledTimes(1);
        expect(_callback2).toBeCalledTimes(1);
    });

    it("Should add a callback to the chain", () =>
    {
        const _callback = vi.fn();

        const chain = new CallbackChain();
        chain.add(_callback);

        expect(chain.size).toBe(1);

        chain();
        expect(_callback).toBeCalledTimes(1);
    });
    it("Should return the chain instance for chaining", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        const chain = new CallbackChain();
        const result = chain.add(_callback1)
            .add(_callback2);

        expect(result).toBe(chain);
    });

    it("Should return false when callback is not found", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        const chain = new CallbackChain(_callback1);
        const removed = chain.remove(_callback2);

        expect(removed).toBe(false);
        expect(chain.size).toBe(1);
    });
    it("Should remove a callback from the chain", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        const chain = new CallbackChain(_callback1, _callback2);
        const removed = chain.remove(_callback1);

        expect(removed).toBe(true);
        expect(chain.size).toBe(1);

        chain();
        expect(_callback1).not.toBeCalled();
        expect(_callback2).toBeCalledTimes(1);
    });
    it("Should only remove the first occurrence", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        const chain = new CallbackChain(_callback1, _callback2, _callback1, _callback2);
        chain.remove(_callback1);

        expect(chain.size).toBe(3);

        chain();
        expect(_callback1).toBeCalledTimes(1);
        expect(_callback2).toBeCalledTimes(2);
    });

    it("Should remove all callbacks from the chain", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();
        const _callback3 = vi.fn();

        const chain = new CallbackChain(_callback1, _callback2, _callback3);
        chain.clear();

        expect(chain.size).toBe(0);

        chain();
        expect(_callback1).not.toBeCalled();
        expect(_callback2).not.toBeCalled();
        expect(_callback3).not.toBeCalled();
    });
    it("Should handle empty chain", () =>
    {
        const chain = new CallbackChain();
        chain.clear();

        expect(chain.size).toBe(0);
        expect(() => chain()).not.toThrow();
    });

    it("Should execute all callbacks in order", () =>
    {
        const _callback1 = vi.fn(() => order.push(1));
        const _callback2 = vi.fn(() => order.push(2));
        const _callback3 = vi.fn(() => order.push(3));

        const order: number[] = [];
        const chain = new CallbackChain(_callback1, _callback2, _callback3);

        chain();

        expect(order).toEqual([1, 2, 3]);
        expect(_callback1).toHaveBeenCalledTimes(1);
        expect(_callback2).toHaveBeenCalledTimes(1);
        expect(_callback3).toHaveBeenCalledTimes(1);
    });

    it("Should pass arguments to all callbacks", () =>
    {
        const _callback1 = vi.fn();
        const _callback2 = vi.fn();

        const chain = new CallbackChain<(a: number, b: string) => void>(_callback1, _callback2);

        chain(42, "test");

        expect(_callback1).toHaveBeenCalledWith(42, "test");
        expect(_callback2).toHaveBeenCalledWith(42, "test");
    });

    it("Should return array of callback results", () =>
    {
        const _callback1 = vi.fn(() => "first");
        const _callback2 = vi.fn(() => "second");
        const _callback3 = vi.fn(() => "third");

        const chain = new CallbackChain(_callback1, _callback2, _callback3);
        const results = chain();

        expect(results).toEqual(["first", "second", "third"]);
    });
    it("Should return empty array when no callbacks", () =>
    {
        const chain = new CallbackChain();
        const results = chain();

        expect(results).toEqual([]);
    });
});
