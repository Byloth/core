import type { MaybePromise } from "../promises/types.js";

/**
 * An union type that represents an iterable object that can be either synchronous or asynchronous.
 *
 * ---
 *
 * @example
 * ```ts
 * const iterable: MaybeAsyncIterable<number> = [...];
 * for await (const value of iterable)
 * {
 *     console.log(value);
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 */
export type MaybeAsyncIterable<T, R = void, N = undefined> = Iterable<T, R, N> | AsyncIterable<T, R, N>;

/**
 * An union type that represents an iterator object that can be either synchronous or asynchronous.
 *
 * ---
 *
 * @example
 * ```ts
 * const iterator: MaybeAsyncIterator<number> = { ... };
 * for await (const value of iterator)
 * {
 *     console.log(value);
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterator.
 */
export type MaybeAsyncIterator<T, R = void, N = undefined> = Iterator<T, R, N> | AsyncIterator<T, R, N>;

/**
 * An union type that represents a generator object that can be either synchronous or asynchronous.
 *
 * ---
 *
 * @example
 * ```ts
 * const generator: MaybeAsyncGenerator<number> = [async] function*() { ... };
 * for await (const value of generator)
 * {
 *     console.log(value);
 * }
 */
export type MaybeAsyncGenerator<T, R = void, N = undefined> = Generator<T, R, N> | AsyncGenerator<T, R, N>;

/**
 * An utility type that represents a function that returns a generator object.  
 * It differs from the native `GeneratorFunction` type by allowing to specify the types of the returned generator.
 *
 * ---
 *
 * @example
 * ```ts
 * const generatorFn: GeneratorFunction<number> = function*() { ... };
 * const generator: Generator<number> = generatorFn();
 *
 * for (const value of generator)
 * {
 *     console.log(value);
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements generated by the generator.
 * @template R The type of the return value of the generator. Default is `void`.
 * @template N The type of the `next` method argument. Default is `undefined`.
 */
export type GeneratorFunction<T, R = void, N = undefined> = () => Generator<T, R, N>;

/**
 * An utility type that represents a function that returns an asynchronous generator object.  
 * It differs from the native `AsyncGeneratorFunction` type by allowing to specify the types of the returned generator.
 *
 * ---
 *
 * @example
 * ```ts
 * const asyncGeneratorFn: AsyncGeneratorFunction<number> = async function*() { ... };
 * const generator: AsyncGenerator<number> = asyncGeneratorFn();
 * for await (const value of generator)
 * {
 *     console.log(value);
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements generated by the generator.
 * @template R The type of the return value of the generator. Default is `void`.
 * @template N The type of the `next` method argument. Default is `undefined`.
 */
export type AsyncGeneratorFunction<T, R = void, N = undefined> = () => AsyncGenerator<T, R, N>;

/**
 * An utility type that represents a function that returns a
 * generator object that can be either synchronous or asynchronous.
 *
 * ---
 *
 * @example
 * ```ts
 * const generatorFn: MaybeAsyncGeneratorFunction<number> = [async] function*() { ... };
 * const generator: MaybeAsyncGenerator<number> = generatorFn();
 * for await (const value of generator)
 * {
 *     console.log(value);
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements generated by the generator.
 * @template R The type of the return value of the generator. Default is `void`.
 * @template N The type of the `next` method argument. Default is `undefined`.
 */
export type MaybeAsyncGeneratorFunction<T, R = void, N = undefined> = () => MaybeAsyncGenerator<T, R, N>;

/**
 * An utility type that represents the standard JavaScript's
 * {@link https://en.wikipedia.org/wiki/Iteratee|iteratee} function.  
 * It can be used to transform the elements of an iterable.
 *
 * ---
 *
 * @example
 * ```ts
 * const iteratee: Iteratee<number, string> = (value: number) => `${value}`;
 * const values: string[] = [1, 2, 3, 4, 5].map(iteratee);
 *
 * console.log(values); // ["1", "2", "3", "4", "5"]
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iteratee. Default is `void`.
 */
export type Iteratee<T, R = void> = (value: T, index: number) => R;

/**
 * An utility type that represents an asynchronous {@link https://en.wikipedia.org/wiki/Iteratee|iteratee} function.  
 * It can be used to transform the elements of an iterable asynchronously.
 *
 * ---
 *
 * @example
 * ```ts
 * const iteratee: AsyncIteratee<number, string> = async (value: number) => `${value}`;
 * const values: Promise<string>[] = [1, 2, 3, 4, 5].map(iteratee);
 * for await (const value of values)
 * {
 *     console.log(value); // "1", "2", "3", "4", "5"
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iteratee. Default is `void`.
 */
export type AsyncIteratee<T, R = void> = (value: T, index: number) => Promise<R>;

/**
 * An utility type that represents an {@link https://en.wikipedia.org/wiki/Iteratee|iteratee}
 * function that can be either synchronous or asynchronous.  
 * It can be used to transform the elements of an iterable.
 *
 * ---
 *
 * @example
 * ```ts
 * const iteratee: MaybeAsyncIteratee<number, string> = [async] (value: number) => `${value}`;
 * const values: Promise<string>[] = [1, 2, 3, 4, 5].map(iteratee);
 * for await (const value of values)
 * {
 *     console.log(value); // "1", "2", "3", "4", "5"
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iteratee. Default is `void`.
 */
export type MaybeAsyncIteratee<T, R = void> = (value: T, index: number) => MaybePromise<R>;

/**
 * An utility type that represents a {@link https://en.wikipedia.org/wiki/Predicate_(mathematical_logic)|predicate}
 * function which acts as a
 * {@link https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates|type guard}.  
 * It can be used to ensure the type of the elements of an iterable
 * while allowing the type-system to infer them correctly.
 *
 * ---
 *
 * @example
 * ```ts
 * const iteratee: TypeGuardPredicate<number | string, string> = (value): value is string => typeof value === "string";
 * const values: string[] = [1, "2", 3, "4", 5].filter(iteratee);
 * for (const value of values)
 * {
 *     console.log(value); // "2", "4"
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template R
 * The type of the elements that pass the type guard.  
 * It must be a subtype of `T`. Default is `T`.
 */
export type TypeGuardPredicate<T, R extends T> = (value: T, index: number) => value is R;

// These types need this Issue to be solved: https://github.com/microsoft/TypeScript/issues/37681
//
// export type AsyncTypeGuardPredicate<T, R extends T> = (value: T, index: number) => value is Promise<R>;
// export type MaybeAsyncTypeGuardPredicate<T, R extends T> = (value: T, index: number) => value is MaybePromise<R>;

/**
 * An utility type that represents a reducer function.  
 * It can be used to reduce the elements of an iterable into a single value.
 *
 * ---
 *
 * @example
 * ```ts
 * const sum: Reducer<number, number> = (accumulator, value) => accumulator + value;
 * const total: number = [1, 2, 3, 4, 5].reduce(sum);
 *
 * console.log(total); // 15
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template A The type of the accumulator.
 */
export type Reducer<T, A> = (accumulator: A, value: T, index: number) => A;

/**
 * An utility type that represents an asynchronous reducer function.  
 * It can be used to reduce the elements of an iterable into a single value.
 *
 * ---
 *
 * @example
 * ```ts
 * const sum: AsyncReducer<number, number> = async (accumulator, value) => accumulator + value;
 * const result = await new SmartAsyncIterator<number>([1, 2, 3, 4, 5]).reduce(sum);
 *
 * console.log(result); // 15
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template A The type of the accumulator.
 */
export type AsyncReducer<T, A> = (accumulator: A, value: T, index: number) => Promise<A>;

/**
 * An utility type that represents a reducer function that can be either synchronous or asynchronous.  
 * It can be used to reduce the elements of an iterable into a single value.
 *
 * ---
 *
 * @example
 * ```ts
 * const sum: MaybeAsyncReducer<number, number> = [async] (accumulator, value) => accumulator + value;
 * const result = await new SmartAsyncIterator<number>([1, 2, 3, 4, 5]).reduce(sum);
 *
 * console.log(result); // 15
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template A The type of the accumulator.
 */
export type MaybeAsyncReducer<T, A> = (accumulator: A, value: T, index: number) => MaybePromise<A>;

/**
 * An union type that represents either an iterable or an iterator object.  
 * More in general, it represents an object that can be looped over in one way or another.
 *
 * ---
 *
 * @example
 * ```ts
 * const elements: IteratorLike<number> = { ... };
 * const iterator: SmartIterator<number> = new SmartIterator(elements);
 * for (const value of iterator)
 * {
 *     console.log(value);
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iterator. Default is `void`.
 * @template N The type of the `next` method argument. Default is `undefined`.
 */
export type IteratorLike<T, R = void, N = undefined> = Iterable<T, R, N> | Iterator<T, R, N>;

/**
 * An union type that represents either an iterable or an iterator object that can be asynchronous.  
 * More in general, it represents an object that can be looped over in one way or another.
 *
 * ---
 *
 * @example
 * ```ts
 * const elements: AsyncIteratorLike<number> = { ... };
 * const iterator: SmartAsyncIterator<number> = new SmartAsyncIterator(elements);
 * for await (const value of iterator)
 * {
 *     console.log(value);
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iterator. Default is `void`.
 * @template N The type of the `next` method argument. Default is `undefined`.
 */
export type AsyncIteratorLike<T, R = void, N = undefined> = AsyncIterable<T, R, N> | AsyncIterator<T, R, N>;

/**
 * An union type that represents either an iterable or an iterator
 * object that can be either synchronous or asynchronous.  
 * More in general, it represents an object that can be looped over in one way or another.
 *
 * ---
 *
 * @example
 * ```ts
 * const elements: MaybeAsyncIteratorLike<number> = { ... };
 * const iterator: SmartAsyncIterator<number> = new SmartAsyncIterator(elements);
 * for await (const value of iterator)
 * {
 *     console.log(value);
 * }
 * ```
 *
 * ---
 *
 * @template T The type of the elements in the iterable.
 * @template R The type of the return value of the iterator. Default is `void`.
 * @template N The type of the `next` method argument. Default is `undefined`.
 */
export type MaybeAsyncIteratorLike<T, R = void, N = undefined> = IteratorLike<T, R, N> | AsyncIteratorLike<T, R, N>;
