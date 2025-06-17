/**
 * An utility type that allows to define a class constructor of a specific type.  
 * Is the counterpart of the native {@link InstanceType} utility type.
 *
 * ---
 *
 * @example
 * ```ts
 * function factory<T extends object>(Factory: Constructor<T>): T { [...] }
 *
 * const instance: MyObject = factory(MyObject);
 * ```
 *
 * ---
 *
 * @template T The type of the instance to create. Default is `object`.
 * @template P The type of the constructor parameters. Default is `any[]`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T extends object = object, P extends unknown[] = any[]> = new (...args: P) => T;

/**
 * A type that represents the return value of {@link setInterval} function,
 * indipendently from the platform it's currently running on.
 *
 * For instance, in a browser environment, it's a {@link Number} value representing the interval ID.  
 * In a Node.js environment, on the other hand, it's an object of type {@link NodeJS.Timeout}.
 *
 * This allows to seamlessly use the same code in both environments, without having to deal with the differences.
 *
 * ---
 *
 * @example
 * ```ts
 * const intervalId: Interval = setInterval(() => { [...] }, 1_000);
 *
 * clearInterval(intervalId);
 * ```
 */
export type Interval = ReturnType<typeof setInterval>;

/**
 * A type that represents the return value of {@link setTimeout} function,
 * indipendently from the platform it's currently running on.
 *
 * For instance, in a browser environment, it's a {@link Number} value representing the timeout ID.  
 * In a Node.js environment, on the other hand, it's an object of type {@link NodeJS.Timeout}.
 *
 * This allows to seamlessly use the same code in both environments, without having to deal with the differences.
 *
 * ---
 *
 * @example
 * ```ts
 * const timeoutId: Timeout = setTimeout(() => { [...] }, 1_000);
 *
 * clearTimeout(timeoutId);
 * ```
 */
export type Timeout = ReturnType<typeof setTimeout>;

/**
 * An utility type that allows to extract the union of the values of a given type.
 * It can be used to extract the values of all the properties of an object type.
 *
 * ---
 *
 * @example
 * ```ts
 * class MyObject
 * {
 *     protected secret = "Sssh! That's a secret!";
 *     public answer = 42;
 *     public greet() { console.log("Hello, world!"); }
 * }
 *
 * type MyObjectProperties = ValueOf<MyObject>; // number | (() => void)
 * ```
 *
 * ---
 *
 * @template T The type to extract the values from.
 */
export type ValueOf<T> = T[keyof T];
