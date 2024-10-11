
import type { MaybePromise } from "../promises/types.js";

export type MaybeAsyncIterable<T, R = void, N = undefined> = Iterable<T, R, N> | AsyncIterable<T, R, N>;
export type MaybeAsyncIterator<T, R = void, N = undefined> = Iterator<T, R, N> | AsyncIterator<T, R, N>;
export type MaybeAsyncGenerator<T, R = void, N = undefined> = Generator<T, R, N> | AsyncGenerator<T, R, N>;

export type GeneratorFunction<T, R = void, N = undefined> = () => Generator<T, R, N>;
export type AsyncGeneratorFunction<T, R = void, N = undefined> = () => AsyncGenerator<T, R, N>;
export type MaybeAsyncGeneratorFunction<T, R = void, N = undefined> = () => MaybeAsyncGenerator<T, R, N>;

export type Iteratee<T, R = void> = (value: T, index: number) => R;
export type AsyncIteratee<T, R = void> = (value: T, index: number) => Promise<R>;
export type MaybeAsyncIteratee<T, R = void> = (value: T, index: number) => MaybePromise<R>;

export type TypeGuardIteratee<T, R extends T> = (value: T, index: number) => value is R;

// @ts-expect-error - This is an asyncronous type guard iteratee that guarantees the return value is a promise.
export type AsyncTypeGuardIteratee<T, R extends T> = (value: T, index: number) => value is Promise<R>;

// @ts-expect-error - This may be an asyncronous type guard iteratee that guarantees the return value may be a promise.
export type MaybeAsyncTypeGuardIteratee<T, R extends T> = (value: T, index: number) => value is MaybePromise<R>;

export type Reducer<T, A> = (accumulator: A, value: T, index: number) => A;
export type AsyncReducer<T, A> = (accumulator: A, value: T, index: number) => Promise<A>;
export type MaybeAsyncReducer<T, A> = (accumulator: A, value: T, index: number) => MaybePromise<A>;

export type IteratorLike<T, R = void, N = undefined> = Iterable<T> | Iterator<T, R, N>;
export type AsyncIteratorLike<T, R = void, N = undefined> = AsyncIterable<T> | AsyncIterator<T, R, N>;
export type MaybeAsyncIteratorLike<T, R = void, N = undefined> = IteratorLike<T, R, N> | AsyncIteratorLike<T, R, N>;
