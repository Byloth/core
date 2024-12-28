import { ReferenceException } from "../exceptions/index.js";

import type { Callback } from "./types.js";

/**
 * A class implementing the
 * {@link https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern|Publish-subscribe} pattern.
 *
 * It can be used to create a simple event system where objects can subscribe
 * to events and receive notifications when the events are published.  
 * It's a simple and efficient way to decouple the objects and make them communicate with each other.
 *
 * Using generics, it's also possible to define the type of the events and the callbacks that can be subscribed to them.
 * 
 * ```ts
 * interface EventsMap
 * {
 *     "player:spawn": (evt: SpawnEvent) => void;
 *     "player:move": ({ x, y }: Point) => void;
 *     "player:death": () => void;
 * }
 *
 * const publisher = new Publisher<EventsMap>();
 *
 * let unsubscribe: () => void;
 * publisher.subscribe("player:death", unsubscribe);
 * publisher.subscribe("player:spawn", (evt) =>
 * {
 *     unsubscribe = publisher.subscribe("player:move", ({ x, y }) => { [...] });
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class Publisher<T extends { [K in keyof T]: Callback<any[], any> } = Record<string, Callback>>
{
    /**
     * A map containing all the subscribers for each event.
     *
     * The keys are the names of the events they are subscribed to.  
     * The values are the arrays of the subscribers themselves.
     */
    protected _subscribers: Map<keyof T, Callback<unknown[], unknown>[]>;

    /**
     * Initializes a new instance of the {@link Publisher} class.
     */
    public constructor()
    {
        this._subscribers = new Map();
    }

    /**
     * Unsubscribes all the subscribers from all the events.
     *
     * ```ts
     * publisher.subscribe("player:spawn", (evt) => { [...] });
     * publisher.subscribe("player:move", (coords) => { [...] });
     * publisher.subscribe("player:move", () => { [...] });
     * publisher.subscribe("player:move", ({ x, y }) => { [...] });
     * publisher.subscribe("player:death", () => { [...] });
     *
     * // All these subscribers are working fine...
     *
     * publisher.clear();
     *
     * // ... but now they're all gone!
     * ```
     */
    public clear(): void
    {
        this._subscribers.clear();
    }

    /**
     * Publishes an event to all the subscribers.
     *
     * ```ts
     * publisher.subscribe("player:move", (coords) => { [...] });
     * publisher.subscribe("player:move", ({ x, y }) => { [...] });
     * publisher.subscribe("player:move", (evt) => { [...] });
     *
     * publisher.publish("player:move", { x: 10, y: 20 });
     * ```
     *
     * ---
     *
     * @param event The name of the event to publish.
     * @param args The arguments to pass to the subscribers.
     *
     * @returns An array containing the return values of all the subscribers.
     */
    public publish<K extends keyof T>(event: K, ...args: Parameters<T[K]>): ReturnType<T[K]>[]
    {
        const subscribers = this._subscribers.get(event);
        if (!(subscribers)) { return []; }

        return subscribers.slice()
            .map((subscriber) => subscriber(...args)) as ReturnType<T[K]>[];
    }

    /**
     * Subscribes a new subscriber to an event.
     *
     * ```ts
     * let unsubscribe: () => void;
     * publisher.subscribe("player:death", unsubscribe);
     * publisher.subscribe("player:spawn", (evt) =>
     * {
     *     unsubscribe = publisher.subscribe("player:move", ({ x, y }) => { [...] });
     * });
     * ```
     *
     * ---
     *
     * @param event The name of the event to subscribe to.
     * @param subscriber The subscriber to add to the event.
     *
     * @returns A function that can be used to unsubscribe the subscriber.
     */
    public subscribe<K extends keyof T>(event: K, subscriber: T[K]): () => void
    {
        if (!(this._subscribers.has(event))) { this._subscribers.set(event, []); }

        const subscribers = this._subscribers.get(event)!;
        subscribers.push(subscriber);

        return () =>
        {
            const index = subscribers.indexOf(subscriber);
            if (index < 0)
            {
                throw new ReferenceException("Unable to unsubscribe the required subscriber. " +
                    "The subscription was already unsubscribed.");
            }

            subscribers.splice(index, 1);
        };
    }

    /**
     * Unsubscribes a subscriber from an event.
     *
     * ```ts
     * const onPlayerMove = ({ x, y }: Point) => { [...] };
     *
     * publisher.subscribe("player:spawn", (evt) => publisher.subscribe("player:move", onPlayerMove));
     * publisher.subscribe("player:death", () => publisher.unsubscribe("player:move", onPlayerMove));
     * ```
     *
     * ---
     *
     * @param event The name of the event to unsubscribe from.
     * @param subscriber The subscriber to remove from the event.
     */
    public unsubscribe<K extends keyof T>(event: K, subscriber: T[K]): void
    {
        const subscribers = this._subscribers.get(event);
        if (!(subscribers)) { return; }

        const index = subscribers.indexOf(subscriber);
        if (index < 0)
        {
            throw new ReferenceException("Unable to unsubscribe the required subscriber. " +
                "The subscription was already unsubscribed or was never subscribed.");
        }

        subscribers.splice(index, 1);
    }

    public readonly [Symbol.toStringTag]: string = "Publisher";
}
