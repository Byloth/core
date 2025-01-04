import type { MaybePromise } from "../promises/types.js";

export type KeyedIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => R;
export type AsyncKeyedIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => Promise<R>;
export type MaybeAsyncKeyedIteratee<K extends PropertyKey, T, R = void> =
    (key: K, value: T, index: number) => MaybePromise<R>;

export type KeyedTypeGuardPredicate<K extends PropertyKey, T, R extends T> =
    (key: K, value: T, index: number) => value is R;

// These types need this Issue to be solved: https://github.com/microsoft/TypeScript/issues/37681
//
// export type AsyncKeyedTypeGuardPredicate<K extends PropertyKey, T, R extends T> =
//     (key: K, value: T, index: number) => value is Promise<R>;
// export type MaybeAsyncKeyedTypeGuardPredicate<K extends PropertyKey, T, R extends T> =
//     (key: K, value: T, index: number) => value is MaybePromise<R>;

export type KeyedReducer<K extends PropertyKey, T, A> = (key: K, accumulator: A, value: T, index: number) => A;
export type AsyncKeyedReducer<K extends PropertyKey, T, A> =
    (key: K, accumulator: A, value: T, index: number) => Promise<A>;

export type MaybeAsyncKeyedReducer<K extends PropertyKey, T, A> =
    (key: K, accumulator: A, value: T, index: number) => MaybePromise<A>;
