import { ReferenceException } from "../exceptions/index.js";
import { TimedPromise } from "../promises/index.js";
import type { PromiseResolver } from "../promises/types.js";

import type { Callback, CallbackMap, InternalsEventsMap, WildcardEventsMap } from "./types.js";

type P = InternalsEventsMap;
type S = WildcardEventsMap & InternalsEventsMap;

type Listener = Callback<unknown[], unknown>;

/**
 * A class implementing the
 * {@link https://en.wikipedia.org/wiki/Observer_pattern|Observer} pattern, in the shape
 * JavaScript developers know from `EventEmitter`: `on`, `once`, `off`, `emit`.
 *
 * It can be used to create a simple event system where objects can listen
 * to events and receive notifications when the events are emitted.  
 * It's a simple and efficient way to decouple the objects and make them communicate with each other.
 *
 * Using generics, it's also possible to define the type of the events and the listeners that can be attached to them.
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
 * const emitter = new EventEmitter<EventsMap>();
 *
 * let unsubscribe: () => void;
 * emitter.on("player:death", unsubscribe);
 * emitter.on("player:spawn", (evt) =>
 * {
 *     unsubscribe = emitter.on("player:move", ({ x, y }) => { [...] });
 * });
 * ```
 *
 * ---
 *
 * @template T
 * A map containing the names of the emittable events and the
 * related listener signatures that can be attached to them.  
 * Default is `Record<string, (...args: unknown[]) => unknown>`.
 */
export default class EventEmitter<T extends CallbackMap<T> = CallbackMap>
{
    /**
     * A map containing all the listeners for each event.
     *
     * The keys are the names of the events they are listening to.  
     * The values are the arrays of the listeners themselves.
     */
    protected readonly _listeners: Map<string, Listener[]>;

    /**
     * A map containing, for each event, the listeners registered with {@link EventEmitter.once}
     * and the internal wrappers actually attached to the event on their behalf.
     *
     * It allows {@link EventEmitter.off} to remove a one-time listener by its original reference.  
     * Entries are removed as soon as the wrapper fires or the listener is detached.
     */
    protected readonly _wrappers: Map<string, Map<Listener, Listener>>;

    /**
     * Initializes a new instance of the {@link EventEmitter} class.
     *
     * ---
     *
     * @example
     * ```ts
     * const emitter = new EventEmitter();
     * ```
     */
    public constructor()
    {
        this._listeners = new Map();
        this._wrappers = new Map();
    }

    /**
     * Attaches a listener to an event, bypassing the typed overloads of {@link EventEmitter.on}.  
     * It's the shared implementation behind `on`, `once` and `wait`.
     *
     * ---
     *
     * @param event The name of the event to listen to.
     * @param listener The listener to execute when the event is emitted.
     *
     * @returns
     * A function that can be used to detach the listener from the event.  
     * It does nothing if the listener has already been detached by other means (`off`, `clear`, …),
     * and throws a {@link ReferenceException} only when called twice.
     */
    protected _attach(event: string, listener: Listener): Callback
    {
        const listeners = this._listeners.get(event) ?? [];
        listeners.push(listener);

        this._listeners.set(event, listeners);

        let detached = false;

        return () =>
        {
            if (detached)
            {
                throw new ReferenceException("Unable to detach the required listener. " +
                    "The listener was already detached.");
            }

            detached = true;

            if (this._listeners.get(event) !== listeners) { return; }

            const index = listeners.indexOf(listener);
            if (index >= 0) { listeners.splice(index, 1); }
        };
    }

    /**
     * Removes a one-time wrapper from the internal bookkeeping,
     * dropping the per-event map as soon as it becomes empty.
     *
     * ---
     *
     * @param event The name of the event the wrapper was attached to.
     * @param wrappers The per-event map the wrapper was registered in.
     * @param listener The original listener the wrapper was created for.
     */
    protected _forgetOnce(event: string, wrappers: Map<Listener, Listener>, listener: Listener): void
    {
        wrappers.delete(listener);
        if ((wrappers.size === 0) && (this._wrappers.get(event) === wrappers))
        {
            this._wrappers.delete(event);
        }
    }

    /**
     * Creates a new scoped instance of the {@link EventEmitter} class,
     * which can be used to emit and listen to events within a specific context.
     *
     * It receives all the events emitted by the parent emitter while also allowing
     * the scoped emitter to handle its own events independently.  
     * In fact, events emitted by the scoped emitter won't be propagated back to the parent emitter.
     *
     * ---
     *
     * @example
     * ```ts
     * const emitter = new EventEmitter();
     * const context = emitter.createScope();
     *
     * emitter.on("player:death", () => console.log("Player has died."));
     * context.on("player:spawn", () => console.log("Player has spawned."));
     *
     * emitter.emit("player:spawn"); // "Player has spawned."
     * context.emit("player:death"); // * no output *
     * ```
     *
     * ---
     *
     * @template U
     * A map containing the additional names of the emittable events and
     * the related listener signatures that can be attached to them.
     * Default is `{ }`.
     *
     * @return
     * A new instance of the {@link EventEmitter} class that can be
     * used to emit and listen to events within a specific context.
     */

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    public createScope<U extends CallbackMap<U> = { }>(): EventEmitter<U & T>
    {
        const scope = new EventEmitter();

        this.on("__internals__:clear", () => scope.clear());
        this.on("*", (event, ...args): void => { scope.emit(event, ...args); });

        return scope;
    }

    /**
     * Emits an event to all its listeners.  
     * The event will trigger the wildcard listeners as well, if any.
     *
     * ---
     *
     * @example
     * ```ts
     * emitter.on("player:move", (coords) => { [...] });
     * emitter.on("player:move", ({ x, y }) => { [...] });
     * emitter.on("player:move", (evt) => { [...] });
     *
     * emitter.emit("player:move", { x: 10, y: 20 });
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the listener signature to emit.
     *
     * @param event The name of the event to emit.
     * @param args The arguments to pass to the listeners.
     *
     * @returns An array containing the return values of all the listeners.
     */
    public emit<K extends keyof T>(event: K & string, ...args: Parameters<T[K]>): ReturnType<T[K]>[];

    /**
     * Emits an internal event to all its listeners.
     *
     * Internal events follow the pattern `__${string}__:${string}` and are used for internal
     * communication within the emitter system. These events won't trigger the wildcard listeners.  
     * Please note to use this method only if you know what you are doing.
     *
     * ---
     *
     * @example
     * ```ts
     * emitter.on("__internals__:clear", () => console.log("Clearing..."));
     * emitter.emit("__internals__:clear"); // "Clearing..."
     * ```
     *
     * ---
     *
     * @template K The key of the internal events map containing the listener signature to emit.
     *
     * @param event The name of the internal event to emit.
     * @param args The arguments to pass to the listeners.
     *
     * @returns An array containing the return values of all the listeners.
     */
    public emit<K extends keyof P>(event: K & string, ...args: Parameters<P[K]>): ReturnType<P[K]>[];
    public emit(event: string, ...args: unknown[]): unknown[]
    {
        let results: unknown[];
        let listeners = this._listeners.get(event);
        if (listeners)
        {
            const _listeners = listeners.slice();
            const _length = _listeners.length;

            results = new Array<unknown>(_length);
            for (let i = 0; i < _length; i += 1)
            {
                results[i] = _listeners[i](...args);
            }
        }
        else { results = []; }

        if (!(event.startsWith("__")))
        {
            listeners = this._listeners.get("*");
            if (listeners)
            {
                listeners.slice()
                    .forEach((listener) => listener(event, ...args));
            }
        }

        return results;
    }

    /**
     * Attaches a listener to an event, to be executed every time the event is emitted.
     *
     * ---
     *
     * @example
     * ```ts
     * let unsubscribe: () => void;
     * emitter.on("player:death", unsubscribe);
     * emitter.on("player:spawn", (evt) =>
     * {
     *     unsubscribe = emitter.on("player:move", ({ x, y }) => { [...] });
     * });
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the listener signature to attach.
     *
     * @param event The name of the event to listen to.
     * @param listener The listener to execute when the event is emitted.
     *
     * @returns
     * A function that can be used to detach the listener from the event.  
     * It does nothing if the listener has already been detached by other means (`off`, `clear`, …),
     * and throws a {@link ReferenceException} only when called twice.
     */
    public on<K extends keyof T>(event: K & string, listener: T[K]): Callback;

    /**
     * Attaches a listener to the wildcard event, to be executed for every emitted event.
     *
     * The wildcard listener receives the event type as the
     * first parameter, followed by all the event arguments.
     *
     * ---
     *
     * @example
     * ```ts
     * emitter.on("*", (type, ...args) =>
     * {
     *     console.log(`Event "${type}" was fired with args:`, args);
     * });
     * ```
     *
     * ---
     *
     * @template K The key of the wildcard events map (always `*`).
     *
     * @param event The wildcard event name (`*`).
     * @param listener The listener to execute for every emitted event.
     *
     * @returns A function that can be used to detach the listener from the wildcard event.
     */
    public on<K extends keyof S>(event: K & string, listener: S[K]): Callback;
    public on(event: string, listener: Listener): Callback
    {
        return this._attach(event, listener);
    }

    /**
     * Attaches a listener to an event, to be executed only the first time the event is emitted.  
     * The listener detaches itself right before running, so it can safely re-attach if needed.
     *
     * The returned function is the safe way to detach a one-time listener: it does nothing
     * if the listener has already fired, and throws only if it's called twice.  
     * {@link EventEmitter.off} works too, but only while the listener is still pending.
     *
     * ---
     *
     * @example
     * ```ts
     * const unsubscribe = emitter.once("game:start", () => console.log("Game has started."));
     *
     * emitter.emit("game:start"); // "Game has started."
     * emitter.emit("game:start"); // * no output *
     *
     * unsubscribe(); // * no-op: the listener already fired *
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the listener signature to attach.
     *
     * @param event The name of the event to listen to.
     * @param listener The listener to execute the first time the event is emitted.
     *
     * @returns A function that can be used to detach the listener from the event.
     */
    public once<K extends keyof T>(event: K & string, listener: T[K]): Callback;

    /**
     * Attaches a listener to the wildcard event, to be executed only for the next emitted event.
     *
     * ---
     *
     * @example
     * ```ts
     * emitter.once("*", (type) => console.log(`First event: "${type}"`));
     * ```
     *
     * ---
     *
     * @template K The key of the wildcard events map (always `*`).
     *
     * @param event The wildcard event name (`*`).
     * @param listener The listener to execute for the next emitted event.
     *
     * @returns A function that can be used to detach the listener from the wildcard event.
     */
    public once<K extends keyof S>(event: K & string, listener: S[K]): Callback;
    public once(event: string, listener: Listener): Callback
    {
        let wrappers = this._wrappers.get(event);
        if (!(wrappers))
        {
            wrappers = new Map();
            this._wrappers.set(event, wrappers);
        }
        else if (wrappers.has(listener))
        {
            throw new ReferenceException("Unable to attach the required listener. " +
                "The listener is already attached once to this event.");
        }

        let fired = false;
        let detached = false;

        const _wrappers = wrappers;
        const _wrapper = (...args: unknown[]): unknown =>
        {
            fired = true;

            this._forgetOnce(event, _wrappers, listener);

            const listeners = this._listeners.get(event);
            const index = listeners?.indexOf(_wrapper) ?? -1;
            if (index >= 0) { listeners!.splice(index, 1); }

            return listener(...args);
        };

        wrappers.set(listener, _wrapper);
        const unsubscribe = this._attach(event, _wrapper);

        return () =>
        {
            if (detached)
            {
                throw new ReferenceException("Unable to detach the required listener. " +
                    "The listener was already detached.");
            }

            detached = true;
            if (fired) { return; }

            this._forgetOnce(event, _wrappers, listener);
            unsubscribe();
        };
    }

    /**
     * Waits for the next emission of an event, resolving with its arguments.  
     * The internal listener is detached as soon as the promise settles, whatever the outcome.
     *
     * ---
     *
     * @example
     * ```ts
     * const [{ x, y }] = await emitter.wait("player:move");
     *
     * try { await emitter.wait("player:spawn", 5_000); }
     * catch (error) { console.log("The player didn't spawn in time."); }
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the listener signature to wait for.
     *
     * @param event The name of the event to wait for.
     * @param timeout
     * The maximum number of milliseconds to wait for the event.  
     * If exceeded, the promise rejects with a {@link TimeoutException}. Default is no timeout.
     *
     * @returns A promise resolving with the arguments the event was emitted with.
     */
    public async wait<K extends keyof T>(event: K & string, timeout?: number): Promise<Parameters<T[K]>>;

    /**
     * Waits for the next emission of any event, resolving with its type and arguments.
     *
     * ---
     *
     * @example
     * ```ts
     * const [type, ...args] = await emitter.wait("*");
     * ```
     *
     * ---
     *
     * @template K The key of the wildcard events map (always `*`).
     *
     * @param event The wildcard event name (`*`).
     * @param timeout
     * The maximum number of milliseconds to wait for an event.  
     * If exceeded, the promise rejects with a {@link TimeoutException}. Default is no timeout.
     *
     * @returns A promise resolving with the event type followed by its arguments.
     */
    public async wait<K extends keyof S>(event: K & string, timeout?: number): Promise<Parameters<S[K]>>;
    public async wait(event: string, timeout?: number): Promise<unknown[]>
    {
        let unsubscribe: Callback;

        const executor = (resolve: PromiseResolver<unknown[]>): void =>
        {
            unsubscribe = this._attach(event, (...args: unknown[]): void => { resolve(args); });
        };

        try
        {
            if (timeout) { return await new TimedPromise(executor, timeout); }

            return await new Promise(executor);
        }
        finally
        {
            unsubscribe!();
        }
    }

    /**
     * Detaches all the listeners from an event.  
     * It does nothing if the event has no listeners attached.
     *
     * ---
     *
     * @example
     * ```ts
     * emitter.on("player:spawn", (evt) => { [...] });
     * emitter.on("player:move", (coords) => { [...] });
     * emitter.on("player:move", () => { [...] });
     * emitter.on("player:move", ({ x, y }) => { [...] });
     * emitter.on("player:death", () => { [...] });
     *
     * // All these listeners are working fine...
     *
     * emitter.off("player:move");
     *
     * // ... but now "player:move" listeners are gone!
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the event to clear.
     *
     * @param event The name of the event to detach all the listeners from.
     */
    public off<K extends keyof T>(event: K & string): void;

    /**
     * Detaches all the listeners from the wildcard event.
     *
     * ---
     *
     * @example
     * ```ts
     * emitter.on("player:spawn", (evt) => { [...] });
     * emitter.on("*", (type, ...args) => { [...] });
     * emitter.on("*", (type, arg1, arg2, arg3) => { [...] });
     * emitter.on("*", (_, arg, ...rest) => { [...] });
     * emitter.on("player:death", () => { [...] });
     *
     * // All these listeners are working fine...
     *
     * emitter.off("*");
     *
     * // ... but now wildcard listeners are gone!
     * ```
     *
     * ---
     *
     * @template K The key of the wildcard events map (`*`).
     *
     * @param event The wildcard event name (`*`).
     */
    public off<K extends keyof S>(event: K & string): void;

    /**
     * Detaches a listener from an event, so it won't be executed anymore when the event is emitted.  
     * It works for listeners attached with {@link EventEmitter.once} too, as long as they haven't fired yet.
     *
     * ---
     *
     * @example
     * ```ts
     * const onPlayerMove = ({ x, y }: Point) => { [...] };
     *
     * emitter.on("player:spawn", (evt) => emitter.on("player:move", onPlayerMove));
     * emitter.on("player:death", () => emitter.off("player:move", onPlayerMove));
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the listener signature to detach.
     *
     * @param event The name of the event to detach the listener from.
     * @param listener The listener to detach.
     */
    public off<K extends keyof T>(event: K & string, listener: T[K]): void;

    /**
     * Detaches a listener from the wildcard event, so it won't be executed anymore for the emitted events.
     *
     * ---
     *
     * @example
     * ```ts
     * const wildcardHandler = (type: string, ...args: unknown[]) => console.log(type, args);
     *
     * emitter.on("*", wildcardHandler);
     * emitter.off("*", wildcardHandler);
     * ```
     *
     * ---
     *
     * @template K The key of the wildcard events map (always `*`).
     *
     * @param event The wildcard event name (`*`).
     * @param listener The wildcard listener to detach.
     */
    public off<K extends keyof S>(event: K & string, listener: S[K]): void;
    public off(event: string, listener?: Listener): void
    {
        const listeners = this._listeners.get(event);

        if (listener === undefined)
        {
            this._listeners.delete(event);
            this._wrappers.delete(event);

            return;
        }

        const wrappers = this._wrappers.get(event);
        const wrapper = wrappers?.get(listener);
        if (wrapper)
        {
            this._forgetOnce(event, wrappers!, listener);

            listener = wrapper;
        }

        const index = listeners?.indexOf(listener) ?? -1;
        if (index < 0)
        {
            throw new ReferenceException("Unable to detach the required listener. " +
                "The listener was already detached or was never attached.");
        }

        listeners!.splice(index, 1);
        if (listeners!.length === 0) { this._listeners.delete(event); }
    }

    /**
     * Detaches all the listeners from all the events.
     *
     * ---
     *
     * @example
     * ```ts
     * emitter.on("player:spawn", (evt) => { [...] });
     * emitter.on("player:move", (coords) => { [...] });
     * emitter.on("*", () => { [...] });
     * emitter.on("player:move", ({ x, y }) => { [...] });
     * emitter.on("player:death", () => { [...] });
     *
     * // All these listeners are working fine...
     *
     * emitter.clear();
     *
     * // ... but now they're all gone!
     * ```
     */
    public clear(): void
    {
        this.emit("__internals__:clear");

        this._listeners.clear();
        this._wrappers.clear();
    }

    public readonly [Symbol.toStringTag]: string = "EventEmitter";
}
