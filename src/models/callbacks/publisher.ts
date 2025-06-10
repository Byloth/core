import { ReferenceException } from "../exceptions/index.js";

import type { Callback, CallbackMap, WithWildcard } from "./types.js";

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
 * ---
 *
 * @example
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
 *
 * ---
 *
 * @template T
 * A map containing the names of the emittable events and the
 * related callback signatures that can be subscribed to them.  
 * Default is `Record<string, (...args: unknown[]) => unknown>`.
 *
 * @template E An utility type that extends the `T` map with a wildcard event.
 */
export default class Publisher<T extends CallbackMap<T> = CallbackMap, W extends WithWildcard<T> = WithWildcard<T>>
{
    /**
     * A map containing all the subscribers for each event.
     *
     * The keys are the names of the events they are subscribed to.  
     * The values are the arrays of the subscribers themselves.
     */
    protected _subscribers: Map<string, Callback<unknown[], unknown>[]>;

    /**
     * Initializes a new instance of the {@link Publisher} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const publisher = new Publisher();
     * ```
     */
    public constructor()
    {
        this._subscribers = new Map();
    }

    /**
     * Unsubscribes all the subscribers from all the events.
     *
     * ---
     *
     * @example
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
     * ---
     *
     * @example
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
     * @template K The key of the map containing the callback signature to publish.
     *
     * @param event The name of the event to publish.
     * @param args The arguments to pass to the subscribers.
     *
     * @returns An array containing the return values of all the subscribers.
     */
    public publish<K extends keyof T>(event: K & string, ...args: Parameters<T[K]>): ReturnType<T[K]>[]
    {
        let results: ReturnType<T[K]>[];
        let subscribers = this._subscribers.get(event);
        if (subscribers)
        {
            results = subscribers.slice()
                .map((subscriber) => subscriber(...args)) as ReturnType<T[K]>[];
        }
        else { results = []; }

        subscribers = this._subscribers.get("*");
        if (subscribers)
        {
            subscribers.slice()
                .forEach((subscriber) => subscriber(event, ...args));
        }

        return results;
    }

    /**
     * Subscribes to an event and adds a subscriber to be executed when the event is published.
     *
     * ---
     *
     * @example
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
     * @template K The key of the map containing the callback signature to subscribe.
     *
     * @param event The name of the event to subscribe to.
     * @param subscriber The subscriber to execute when the event is published.
     *
     * @returns A function that can be used to unsubscribe the subscriber from the event.
     */
    public subscribe<K extends keyof W>(event: K & string, subscriber: W[K]): () => void
    {
        const subscribers = this._subscribers.get(event) ?? [];
        subscribers.push(subscriber);

        this._subscribers.set(event, subscribers);

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
     * Unsubscribes from an event and removes a subscriber from being executed when the event is published.
     *
     * ---
     *
     * @example
     * ```ts
     * const onPlayerMove = ({ x, y }: Point) => { [...] };
     *
     * publisher.subscribe("player:spawn", (evt) => publisher.subscribe("player:move", onPlayerMove));
     * publisher.subscribe("player:death", () => publisher.unsubscribe("player:move", onPlayerMove));
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the callback signature to unsubscribe.
     *
     * @param event The name of the event to unsubscribe from.
     * @param subscriber The subscriber to remove from the event.
     */
    public unsubscribe<K extends keyof W>(event: K & string, subscriber: W[K]): void
    {
        const subscribers = this._subscribers.get(event);
        if (!(subscribers))
        {
            throw new ReferenceException("Unable to unsubscribe the required subscriber. " +
                "The subscription was already unsubscribed or was never subscribed.");
        }

        const index = subscribers.indexOf(subscriber);
        if (index < 0)
        {
            throw new ReferenceException("Unable to unsubscribe the required subscriber. " +
                "The subscription was already unsubscribed or was never subscribed.");
        }

        subscribers.splice(index, 1);
        if (subscribers.length === 0) { this._subscribers.delete(event); }
    }

    public readonly [Symbol.toStringTag]: string = "Publisher";
}
