import type { MaybePromise } from "../promises/types.js";

export type KeyIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => R;
export type MaybeAsyncKeyIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) =>
    MaybePromise<R>;

export type KeyTypeGuardIteratee<K extends PropertyKey, T, R extends T> =
    (key: K, value: T, index: number) => value is R;
export type MaybeAsyncKeyTypeGuardIteratee<K extends PropertyKey, T, R extends T> =
    (key: K, value: MaybePromise<T>, index: number) => value is Awaited<R>;

export type KeyReducer<K extends PropertyKey, T, A> = (key: K, accumulator: A, value: T, index: number) => A;
export type MaybeAsyncKeyReducer<K extends PropertyKey, T, A> =
    (key: K, accumulator: A, value: T, index: number) => MaybePromise<A>;
