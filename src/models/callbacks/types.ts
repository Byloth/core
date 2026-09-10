// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type EventEmitter from "./event-emitter.js";

/**
 * A type that represents a generic function.
 *
 * It can be used to define the signature of a callback, a event handler or any other function.  
 * It's simply a shorthand for the `(...args: A) => R` function signature.
 *
 * ---
 *
 * @example
 * ```ts
 * const callback: Callback<[PointerEvent]> = (evt: PointerEvent): void => { [...] };
 * ```
 *
 * ---
 *
 * @template A
 * The type of the arguments that the function accepts.  
 * It must be an array of types, even if it's empty. Default is `[]`.
 *
 * @template R The return type of the function. Default is `void`.
 */
export type Callback<A extends unknown[] = [], R = void> = (...args: A) => R;

/**
 * An utility type that is required to represents a map of callbacks.
 *
 * It is used for type inheritance on the {@link EventEmitter} class signature.  
 * Whenever you'll need to extend that class, you may need to use this type too.
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
 * class EventManager<T extends CallbackMap<T> = { }> extends EventEmitter<T> { [...] }
 * ```
 *
 * ---
 *
 * @template T The interface defining the map of callbacks. Default is `Record<string, Callback<unknown[], unknown>>`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CallbackMap<T = Record<string, Callback<unknown[], unknown>>> = { [K in keyof T]: Callback<any[], any> };

/**
 * An utility type that represents a map of internal events that may
 * be used by the {@link EventEmitter} class or its child classes.
 *
 * Internal events follow the pattern `__${string}__:${string}` and
 * are used for internal communication within the emitter system.  
 * These events are not part of the public API but can be listened to for advanced use cases.
 *
 * ---
 *
 * @example
 * ```ts
 * const emitter = new EventEmitter<EventsMap>();
 *
 * emitter.on("__internals__:clear", () => console.log("Emitter cleared"));
 * emitter.clear(); // "Emitter cleared"
 * ```
 */
export type InternalsEventsMap = Record<`__${string}__:${string}`, Callback<unknown[], unknown>>;

/**
 * An utility interface that defines a wildcard event for listening to all events.
 *
 * The wildcard event uses the `"*"` key and provides a callback that receives
 * the event type as the first parameter, followed by all the event arguments.
 *
 * It's natively used by the {@link EventEmitter} class to allow listeners to listen to all events.
 *
 * ---
 *
 * @example
 * ```ts
 * const emitter = new EventEmitter<EventsMap>();
 *
 * emitter.on("*", (type: string, ...args: unknown[]) =>
 * {
 *     console.log(`Event "${type}" was fired with args:`, args));
 * });
 *
 * emitter.emit("player:move", { x: 10, y: 20 }); // "Event `player:move` was fired with args: [{ x: 10, y: 20 }]"
 * emitter.emit("player:death"); // "Event `player:death` was fired with args: []"
 * ```
 */
export interface WildcardEventsMap { "*": (type: string, ...args: unknown[]) => void }

/**
 * An utility type that represents an {@link EventEmitter} object that can only emit events.
 * See also {@link Listenable}.
 *
 * It can be used to hand out the emitting side of an emitter
 * without exposing the ability to attach or detach listeners.
 *
 * ---
 *
 * @template T
 * A map containing the names of the emittable events and the
 * related listener signatures that can be attached to them.  
 * Default is `Record<string, (...args: unknown[]) => unknown>`.
 */
export interface Emittable<T extends CallbackMap<T> = CallbackMap>
{
    /**
     * Emits an event to all its listeners.
     *
     * ---
     *
     * @example
     * ```ts
     * emittable.emit("player:move", { x: 10, y: 20 });
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
    emit<K extends keyof T>(event: K & string, ...args: Parameters<T[K]>): ReturnType<T[K]>[];
}

/**
 * An utility type that represents an {@link EventEmitter} object that can only be listened to.
 * See also {@link Emittable}.
 *
 * It can be used to hand out the listening side of an emitter without
 * exposing the ability to emit events or to detach other listeners.
 *
 * ---
 *
 * @template T
 * A map containing the names of the emittable events and the
 * related listener signatures that can be attached to them.  
 * Default is `Record<string, (...args: unknown[]) => unknown>`.
 */
export interface Listenable<T extends CallbackMap<T> = CallbackMap>
{
    /**
     * Attaches a listener to an event, to be executed every time the event is emitted.
     *
     * ---
     *
     * @example
     * ```ts
     * const unsubscribe = listenable.on("player:move", ({ x, y }) => { [...] });
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the listener signature to attach.
     *
     * @param event The name of the event to listen to.
     * @param listener The listener to execute when the event is emitted.
     *
     * @returns A function that can be used to detach the listener from the event.
     */
    on<K extends keyof T>(event: K & string, listener: T[K]): Callback;

    /**
     * Attaches a listener to an event, to be executed only the first time the event is emitted.
     *
     * ---
     *
     * @example
     * ```ts
     * listenable.once("game:start", () => { [...] });
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
    once<K extends keyof T>(event: K & string, listener: T[K]): Callback;

    /**
     * Waits for the next emission of an event, resolving with its arguments.
     *
     * ---
     *
     * @example
     * ```ts
     * const [{ x, y }] = await listenable.wait("player:move");
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the listener signature to wait for.
     *
     * @param event The name of the event to wait for.
     * @param timeout The maximum number of milliseconds to wait for the event. Default is no timeout.
     *
     * @returns A promise resolving with the arguments the event was emitted with.
     */
    wait<K extends keyof T>(event: K & string, timeout?: number): Promise<Parameters<T[K]>>;

    /**
     * Detaches a listener from an event, so it won't be executed anymore when the event is emitted.
     *
     * ---
     *
     * @example
     * ```ts
     * const onPlayerMove = ({ x, y }: Point) => { [...] };
     *
     * listenable.on("player:spawn", (evt) => listenable.on("player:move", onPlayerMove));
     * listenable.on("player:death", () => listenable.off("player:move", onPlayerMove));
     * ```
     *
     * ---
     *
     * @template K The key of the map containing the listener signature to detach.
     *
     * @param event The name of the event to detach the listener from.
     * @param listener The listener to detach.
     */
    off<K extends keyof T>(event: K & string, listener: T[K]): void;
}
