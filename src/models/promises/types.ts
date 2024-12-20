export type { LongRunningTaskOptions } from "./long-running-task.js";

export type MaybePromise<T> = T | PromiseLike<T>;

export type FulfilledHandler<T = void, R = T> = (value: T) => MaybePromise<R>;
export type RejectedHandler<E = unknown, R = never> = (reason: E) => MaybePromise<R>;

export type PromiseResolver<T = void> = (result: MaybePromise<T>) => void;
export type PromiseRejecter<E = unknown> = (reason?: MaybePromise<E>) => void;
export type PromiseExecutor<T = void, E = unknown> = (resolve: PromiseResolver<T>, reject: PromiseRejecter<E>) => void;
