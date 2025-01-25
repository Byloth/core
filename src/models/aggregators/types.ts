import type { MaybePromise } from "../promises/types.js";

/**
 * An utility type that represents an {@link https://en.wikipedia.org/wiki/Iteratee|iteratee}-like function
 * with the addition of a `key` parameter, compared to the JavaScript's standard ones.  
 * It can be used to transform the elements of an aggregated iterable.
 *
 * ```ts
 * const iteratee: KeyedIteratee<string, number, string> = (key: string, value: number) => `${value}`;
 * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
 *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
 *     .map(iteratee);
 *
 * console.log(results.toObject()); // { odd: ["-3", "-1", "3", "5"], even: ["0", "2", "6", "8"] }
 * ```
 *
 * ---
 *
 * @template K The type of the key used to aggregate elements in the iterable.
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iteratee. Default is `void`.
 */
export type KeyedIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => R;

/**
 * An utility type that represents an asynchronous {@link https://en.wikipedia.org/wiki/Iteratee|iteratee}-like
 * function with the addition of a `key` parameter.  
 * It can be used to transform the elements of an aggregated iterable asynchronously.
 *
 * ```ts
 * const iteratee: AsyncKeyedIteratee<string, number, string> = async (key: string, value: number) => `${value}`;
 * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
 *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
 *     .map(iteratee);
 *
 * console.log(await results.toObject()); // { odd: ["-3", "-1", "3", "5"], even: ["0", "2", "6", "8"] }
 * ```
 *
 * ---
 *
 * @template K The type of the key used to aggregate elements in the iterable.
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iteratee. Default is `void`.
 */
export type AsyncKeyedIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => Promise<R>;

/**
 * An utility type that represents an {@link https://en.wikipedia.org/wiki/Iteratee|iteratee}-like function
 * with the addition of a `key` parameter that can be either synchronous or asynchronous.  
 * It can be used to transform the elements of an aggregated iterable.
 *
 * ```ts
 * const iteratee: AsyncKeyedIteratee<string, number, string> = [async] (key: string, value: number) => `${value}`;
 * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
 *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
 *     .map(iteratee);
 *
 * console.log(await results.toObject()); // { odd: ["-3", "-1", "3", "5"], even: ["0", "2", "6", "8"] }
 * ```
 *
 * ---
 *
 * @template K The type of the key used to aggregate elements in the iterable.
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iteratee. Default is `void`.
 */
export type MaybeAsyncKeyedIteratee<K extends PropertyKey, T, R = void> =
    (key: K, value: T, index: number) => MaybePromise<R>;

/**
 * An utility type that represents a {@link https://en.wikipedia.org/wiki/Predicate_(mathematical_logic)|predicate}-like
 * function with the addition of a `key` parameter, compared to the JavaScript's standard ones,
 * which act as a
 * {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates|type guard}.  
 * It can be used to filter the elements of an aggregated iterable
 * while allowing the type-system to infer them correctly.
 *
 * ```ts
 * const predicate: KeyedTypeGuardPredicate<string, number | string, string> =
 *     (key: string, value: number | string): value is string => typeof value === "string";
 *
 * const results = new SmartIterator<number | string>([-3, -1, "0", 2, 3, "5", 6, "8"])
 *     .groupBy((value) => Number(value) % 2 === 0 ? "even" : "odd")
 *     .filter(predicate);
 *
 * console.log(results.toObject()); // { odd: ["0", "5", "8"], even: [] }
 * ```
 *
 * ---
 *
 * @template K The type of the key used to aggregate elements in the iterable.
 * @template T The type of the elements in the iterable.
 * @template R
 * The type of the return value of the predicate.  
 * It must be a subtype of `T`. Default is `T`.
 */
export type KeyedTypeGuardPredicate<K extends PropertyKey, T, R extends T> =
    (key: K, value: T, index: number) => value is R;

// These types need this Issue to be solved: https://github.com/microsoft/TypeScript/issues/37681
//
// export type AsyncKeyedTypeGuardPredicate<K extends PropertyKey, T, R extends T> =
//     (key: K, value: T, index: number) => value is Promise<R>;
// export type MaybeAsyncKeyedTypeGuardPredicate<K extends PropertyKey, T, R extends T> =
//     (key: K, value: T, index: number) => value is MaybePromise<R>;

/**
 * An utility type that represents a reducer-like function.  
 * It can be used to reduce the elements of an aggregated iterable into a single value.
 *
 * ```ts
 * const sum: KeyedReducer<string, number, number> =
 *     (key: string, accumulator: number, value: number) => accumulator + value;
 *
 * const results = new SmartIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
 *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
 *     .reduce(sum);
 *
 * console.log(results.toObject()); // { odd: 4, even: 16 }
 * ```
 *
 * ---
 *
 * @template K The type of the key used to aggregate elements in the iterable.
 * @template T The type of the elements in the iterable.
 * @template A The type of the accumulator.
 */
export type KeyedReducer<K extends PropertyKey, T, A> = (key: K, accumulator: A, value: T, index: number) => A;

/**
 * An utility type that represents an asynchronous reducer-like function.  
 * It can be used to reduce the elements of an aggregated iterable into a single value.
 *
 * ```ts
 * const sum: AsyncKeyedReducer<string, number, number> =
 *     async (key: string, accumulator: number, value: number) => accumulator + value;
 *
 * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
 *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
 *     .reduce(sum);
 *
 * console.log(await results.toObject()); // { odd: 4, even: 16 }
 * ```
 *
 * ---
 *
 * @template K The type of the key used to aggregate elements in the iterable.
 * @template T The type of the elements in the iterable.
 * @template A The type of the accumulator.
 */
export type AsyncKeyedReducer<K extends PropertyKey, T, A> =
    (key: K, accumulator: A, value: T, index: number) => Promise<A>;

/**
 * An utility type that represents a reducer-like function that can be either synchronous or asynchronous.  
 * It can be used to reduce the elements of an aggregated iterable into a single value.
 *
 * ```ts
 * const sum: MaybeAsyncKeyedReducer<string, number, number> =
 *     [async] (key: string, accumulator: number, value: number) => accumulator + value;
 *
 * const results = new SmartAsyncIterator<number>([-3, -1, 0, 2, 3, 5, 6, 8])
 *     .groupBy((value) => value % 2 === 0 ? "even" : "odd")
 *     .reduce(sum);
 *
 * console.log(await results.toObject()); // { odd: 4, even: 16 }
 * ```
 *
 * ---
 *
 * @template K The type of the key used to aggregate elements in the iterable.
 * @template T The type of the elements in the iterable.
 * @template A The type of the accumulator.
 */
export type MaybeAsyncKeyedReducer<K extends PropertyKey, T, A> =
    (key: K, accumulator: A, value: T, index: number) => MaybePromise<A>;
