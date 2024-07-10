import type { MaybePromise } from "../promises/types.js";

export type GeneratorFunction<T, R = void, N = undefined> = () => Generator<T, R, N>;
export type AsyncGeneratorFunction<T, R = void, N = undefined> = () => AsyncGenerator<T, R, N>;

export type Iteratee<T, R = void> = (value: T, index: number) => R;
export type MaybeAsyncIteratee<T, R = void> = (value: T, index: number) => MaybePromise<R>;

export type TypeGuardIteratee<T, R extends T> = (value: T, index: number) => value is R;
export type MaybeAsyncTypeGuardIteratee<T, R extends T> = (value: MaybePromise<T>, index: number) =>
    value is MaybePromise<R>;

export type Reducer<T, A> = (accumulator: A, value: T, index: number) => A;
export type MaybeAsyncReducer<T, A> = (accumulator: A, value: T, index: number) => MaybePromise<A>;

export type Iterables<T, R = void, N = undefined> = Iterable<T> | Iterator<T, R, N> | GeneratorFunction<T, R, N>;
export type AsyncIterables<T, R = void, N = undefined> =
    AsyncIterable<T> | AsyncIterator<T, R, N> | AsyncGeneratorFunction<T, R, N>;

export type MaybeAsyncIterables<T, R = void, N = undefined> = Iterables<T, R, N> | AsyncIterables<T, R, N>;
