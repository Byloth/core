import { SmartPromise } from "../models/index.js";

/**
 * Returns a promise that resolves after a certain number of milliseconds.  
 * It can be used to pause or delay the execution of an asynchronous function.
 *
 * ---
 *
 * @example
 * ```ts
 * doSomething();
 * await delay(1_000);
 * doSomethingElse();
 * ```
 *
 * ---
 *
 * @param milliseconds The number of milliseconds to wait before resolving the promise.
 *
 * @returns A {@link SmartPromise} that resolves after the specified number of milliseconds.
 */
export function delay(milliseconds: number): SmartPromise<void>
{
    return new SmartPromise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Returns a promise that resolves on the next animation frame.  
 * It can be used to synchronize operations with the browser's rendering cycle.
 *
 * ---
 *
 * @example
 * ```ts
 * const $el = document.querySelector(".element");
 *
 * $el.classList.add("animate");
 * await nextAnimationFrame();
 * $el.style.opacity = "1";
 * ```
 *
 * ---
 *
 * @returns A {@link SmartPromise} that resolves on the next animation frame.
 */
export function nextAnimationFrame(): SmartPromise<void>
{
    return new SmartPromise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Returns a promise that resolves on the next microtask.  
 * It can be used to yield to the event loop in long-running operations to prevent blocking the main thread.
 *
 * ---
 *
 * @example
 * ```ts
 * for (let i = 0; i < 100_000_000; i += 1)
 * {
 *     doSomething(i);
 *
 *     if (i % 100 === 0) await yieldToEventLoop();
 * }
 * ```
 *
 * ---
 *
 * @returns A {@link SmartPromise} that resolves on the next microtask.
 */
export function yieldToEventLoop(): SmartPromise<void>
{
    return new SmartPromise((resolve) => setTimeout(resolve));
}
