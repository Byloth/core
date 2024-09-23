/* eslint-disable max-len */

import type { MaybePromise } from "../promises/types.js";

export type KeyedIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => R;
export type AsyncKeyedIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => Promise<R>;
export type MaybeAsyncKeyedIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => MaybePromise<R>;

export type KeyedTypeGuardIteratee<K extends PropertyKey, T, R extends T> = (key: K, value: T, index: number) => value is R;

// @ts-expect-error - This is an asyncronous type guard keyed-iteratee that guarantees the return value is a promise.
export type AsyncKeyedTypeGuardIteratee<K extends PropertyKey, T, R extends T> = (key: K, value: T, index: number) => value is Promise<R>;

// @ts-expect-error - This may be an asyncronous type guard keyed-iteratee that guarantees the return value may be a promise.
export type MaybeAsyncKeyedTypeGuardIteratee<K extends PropertyKey, T, R extends T> = (key: K, value: T, index: number) => value is MaybePromise<R>;

export type KeyedReducer<K extends PropertyKey, T, A> = (key: K, accumulator: A, value: T, index: number) => A;
export type AsyncKeyedReducer<K extends PropertyKey, T, A> = (key: K, accumulator: A, value: T, index: number) => Promise<A>;
export type MaybeAsyncKeyedReducer<K extends PropertyKey, T, A> = (key: K, accumulator: A, value: T, index: number) => MaybePromise<A>;
