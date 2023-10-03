export type Constructor<T extends object, P extends Array<unknown> = []> = new (...args: P) => T;
export type MaybePromise<T> = T | PromiseLike<T>;

export type FulfilledHandler<T, R = T> = (value: T) => MaybePromise<R>;
export type RejectedHandler<E, R = E> = (reason: E) => MaybePromise<R>;

export type PromiseResolver<T = void> = (result: MaybePromise<T>) => void;
export type PromiseRejecter<E = unknown> = (reason: E) => void;
export type PromiseExecutor<T = void, E = unknown> = (resolve: PromiseResolver<T>, reject: PromiseRejecter<E>) => void;
