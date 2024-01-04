// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T extends object, P extends unknown[] = any[]> = new (...args: P) => T;

export type GeneratorFunction<T, R = void, N = undefined> = () => Generator<T, R, N>;
export type Iteratee<T, R = void> = (value: T, index: number) => R;
export type Reducer<T, A> = (accumulator: A, value: T, index: number) => A;

export type MaybePromise<T> = T | PromiseLike<T>;

export type FulfilledHandler<T = void, R = T> = (value: T) => MaybePromise<R>;
export type RejectedHandler<E = unknown, R = never> = (reason: E) => MaybePromise<R>;

export type PromiseResolver<T = void> = (result?: MaybePromise<T>) => void;
export type PromiseRejecter<E = unknown> = (reason?: MaybePromise<E>) => void;
export type PromiseExecutor<T = void, E = unknown> = (resolve: PromiseResolver<T>, reject: PromiseRejecter<E>) => void;
