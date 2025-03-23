/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Callback } from "./types.js";

const SmartFunction = (Function as unknown) as new<A extends unknown[] = [], R = void>(...args: string[])
    => (...args: A) => R;

/**
 * An abstract class that can be used to implement callable objects.
 *
 * ---
 *
 * @example
 * ```ts
 * class ActivableCallback extends CallableObject<(evt: PointerEvent) => void>
 * {
 *     public enabled = false;
 *     protected _invoke(): void
 *     {
 *         if (this.enabled) { [...] }
 *     }
 * }
 *
 * const callback = new ActivableCallback();
 *
 * window.addEventListener("pointerdown", () => { callback.enabled = true; });
 * window.addEventListener("pointermove", callback);
 * window.addEventListener("pointerup", () => { callback.enabled = false; });
 * ```
 *
 * ---
 *
 * @template T
 * The type signature of the callback function.  
 * It must be a function. Default is `(...args: any[]) => any`.
 */
export default abstract class CallableObject<T extends Callback<any[], any> = () => void>
    extends SmartFunction<Parameters<T>, ReturnType<T>>
{
    /**
     * Initializes a new instance of the {@link CallableObject} class.
     */
    public constructor()
    {
        super(`return this._invoke(...arguments);`);

        const self = this.bind(this);
        Object.setPrototypeOf(this, self);

        return self as this;
    }

    /**
     * The method that will be called when the object is invoked.  
     * It must be implemented by the derived classes.
     *
     * @param args The arguments that have been passed to the object.
     *
     * @returns The return value of the method.
     */
    protected abstract _invoke(...args: Parameters<T>): ReturnType<T>;

    public readonly [Symbol.toStringTag]: string = "CallableObject";
}
