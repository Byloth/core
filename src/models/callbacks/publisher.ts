import { ReferenceException } from "../exceptions/index.js";

import type { Callback, CallbackMap, InternalsEventsMap, WildcardEventsMap } from "./types.js";

type I = InternalsEventsMap;
type W = WildcardEventsMap;

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
 */
export default class Publisher<T extends CallbackMap<T> = CallbackMap>
{
    /**
     * A map containing all the subscribers for each event.
     *
     * The keys are the names of the events they are subscribed to.  
     * The values are the arrays of the subscribers themselves.
     */
    protected readonly _subscribers: Map<string, Callback<unknown[], unknown>[]>;

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
        this.publish("__internals__:clear");

        this._subscribers.clear();
    }

    /**
     * Creates a new scoped instance of the {@link Publisher} class,
     * which can be used to publish and subscribe events within a specific context.
     *
     * It can receive all events published to the parent publisher while also allowing
     * the scoped publisher to handle its own events independently.  
     * In fact, events published to the scoped publisher won't be propagated back to the parent publisher.
     *
     * ---
     *
     * @example
     * ```ts
     * const publisher = new Publisher();
     * const context = publisher.createScope();
     *
     * publisher.subscribe("player:death", () => console.log(`Player has died.`));
     * context.subscribe("player:spawn", () => console.log(`Player has spawned.`));
     *
     * publisher.publish("player:spawn"); // "Player has spawned."
     * context.publish("player:death"); // * no output *
     * ```
     *
     * ---
     *
     * @template U
     * A map containing the names of the emittable events and the
     * related callback signatures that can be subscribed to them.
     * Default is `T`.
     *
     * @return
     * A new instance of the {@link Publisher} class that can be
     * used to publish and subscribe events within a specific context.
     */
    public createScope<U extends T = T>(): Publisher<U>
    {
        const scope = new Publisher<U>();

        this.subscribe("__internals__:clear", () => scope.clear());
        this.subscribe("*", (event, ...args): void =>
        {
            scope.publish(event as keyof U & string, ...args as Parameters<U[keyof U]>);
        });

        return scope;
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
    public publish<K extends keyof T>(event: K & string, ...args: Parameters<T[K]>): ReturnType<T[K]>[];

    /**
     * Publishes an internal event to all the subscribers.
     *
     * Internal events follow the pattern `__${string}__:${string}` and are used for internal
     * communication within the publisher system. These events won't trigger wildcard listeners.
     *
     * ---
     *
     * @example
     * ```ts
     * publisher.subscribe("__internals__:clear", () => console.log("Clearing..."));
     * publisher.publish("__internals__:clear"); // "Clearing..."
     * ```
     *
     * ---
     *
     * @template K The key of the internal events map containing the callback signature to publish.
     *
     * @param event The name of the internal event to publish.
     * @param args The arguments to pass to the subscribers.
     *
     * @returns An array containing the return values of all the subscribers.
     */
    public publish<K extends keyof I>(event: K & string, ...args: Parameters<I[K]>): ReturnType<I[K]>[];
    public publish(event: string, ...args: unknown[]): unknown[]
    {
        let results: unknown[];
        let subscribers = this._subscribers.get(event);
        if (subscribers)
        {
            results = subscribers.slice()
                .map((subscriber) => subscriber(...args));
        }
        else { results = []; }

        if (!(event.startsWith("__")))
        {
            subscribers = this._subscribers.get("*");
            if (subscribers)
            {
                subscribers.slice()
                    .forEach((subscriber) => subscriber(event, ...args));
            }
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
    public subscribe<K extends keyof T>(event: K & string, subscriber: T[K]): () => void;

    /**
     * Subscribes to the wildcard event to listen to all published events.
     *
     * The wildcard subscriber will be called for every event published, receiving
     * the event type as the first parameter followed by all event arguments.
     *
     * ---
     *
     * @example
     * ```ts
     * publisher.subscribe("*", (type, ...args) =>
     * {
     *     console.log(`Event \`${type}\` was fired with args:`, args);
     * });
     * ```
     *
     * ---
     *
     * @template K The key of the wildcard events map (always "*").
     *
     * @param event The wildcard event name ("*").
     * @param subscriber The subscriber to execute for all published events.
     *
     * @returns A function that can be used to unsubscribe the subscriber from the wildcard event.
     */
    public subscribe<K extends keyof W>(event: K & string, subscriber: W[K]): () => void;

    /**
     * Subscribes to an internal event and adds a subscriber to be executed when the event is published.
     *
     * Internal events follow the pattern `__${string}__:${string}` and
     * are used for internal communication within the publisher system.  
     * Please note to use this method only if you know what you are doing.
     *
     * ---
     *
     * @example
     * ```ts
     * publisher.subscribe("__internals__:clear", () => console.log("All subscribers have been cleared."));
     * publisher.clear(); // "All subscribers have been cleared."
     * ```
     *
     * ---
     *
     * @template K The key of the internal events map containing the callback signature to subscribe.
     *
     * @param event The name of the internal event to subscribe to.
     * @param subscriber The subscriber to execute when the internal event is published.
     *
     * @returns A function that can be used to unsubscribe the subscriber from the event.
     */
    public subscribe<K extends keyof I>(event: K & string, subscriber: I[K]): () => void;
    public subscribe(event: string, subscriber: Callback<unknown[], unknown>): () => void
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
    public unsubscribe<K extends keyof T>(event: K & string, subscriber: T[K]): void;

    /**
     * Unsubscribes from the wildcard event and removes a subscriber from being executed for all events.
     *
     * This removes a previously registered wildcard listener that was capturing all published events.
     *
     * ---
     *
     * @example
     * ```ts
     * const wildcardHandler = (type: string, ...args: unknown[]) => console.log(type, args);
     * 
     * publisher.subscribe("*", wildcardHandler);
     * publisher.unsubscribe("*", wildcardHandler);
     * ```
     *
     * ---
     *
     * @template K The key of the wildcard events map (always "*").
     *
     * @param event The wildcard event name ("*").
     * @param subscriber The wildcard subscriber to remove.
     */
    public unsubscribe<K extends keyof W>(event: K & string, subscriber: W[K]): void;

    /**
     * Unsubscribes from an internal event and removes a subscriber from being executed when the event is published.
     *
     * Internal events follow the pattern `__${string}__:${string}` and
     * are used for internal communication within the publisher system.
     *
     * ---
     *
     * @example
     * ```ts
     * const onClear = () => console.log("Publisher cleared");
     * 
     * publisher.subscribe("__internals__:clear", onClear);
     * publisher.unsubscribe("__internals__:clear", onClear);
     * ```
     *
     * ---
     *
     * @template K The key of the internal events map containing the callback signature to unsubscribe.
     *
     * @param event The name of the internal event to unsubscribe from.
     * @param subscriber The subscriber to remove from the internal event.
     */
    public unsubscribe<K extends keyof I>(event: K & string, subscriber: I[K]): void;
    public unsubscribe(event: string, subscriber: Callback<unknown[], unknown>): void
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
