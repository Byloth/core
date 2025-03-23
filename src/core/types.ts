/**
 * A utility type that allows to define a class constructor of a specific type.  
 * Is the counterpart of the native `InstanceType` utility type.
 *
 * ---
 *
 * @example
 * ```ts
 * function factory<T extends object>(Factory: Constructor<T>): T { [...] }
 *
 * const instance: MyObject = factory(MyObject);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T extends object, P extends unknown[] = any[]> = new (...args: P) => T;

/**
 * A type that represents the return value of `setInterval` function,
 * indipendently from the platform it's currently running on.
 *
 * For instance, in a browser environment, it's a `number` value representing the interval ID.  
 * In a Node.js environment, on the other hand, it's an object of type `NodeJS.Timeout`.
 *
 * This allows to seamlessly use the same code in both environments, without having to deal with the differences:
 *
 * ```ts
 * const intervalId: Interval = setInterval(() => { [...] }, 1_000);
 *
 * clearInterval(intervalId);
 * ```
 */
export type Interval = ReturnType<typeof setInterval>;

/**
 * A type that represents the return value of `setTimeout` function,
 * indipendently from the platform it's currently running on.
 *
 * For instance, in a browser environment, it's a `number` value representing the timeout ID.  
 * In a Node.js environment, on the other hand, it's an object of type `NodeJS.Timeout`.
 *
 * This allows to seamlessly use the same code in both environments, without having to deal with the differences:
 *
 * ```ts
 * const timeoutId: Timeout = setTimeout(() => { [...] }, 1_000);
 *
 * clearTimeout(timeoutId);
 * ```
 */
export type Timeout = ReturnType<typeof setTimeout>;
