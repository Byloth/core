/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Callback } from "./types.js";

export const SmartFunction = (Function as unknown) as new<A extends unknown[] = [], R = void>(...args: string[])
    => (...args: A) => R;

export default abstract class CallableObject<T extends Callback<any[], any> = () => void>
    extends SmartFunction<Parameters<T>, ReturnType<T>>
{
    public constructor()
    {
        super(`return this._invoke(...arguments);`);

        const self = this.bind(this);
        Object.setPrototypeOf(this, self);

        return self as this;
    }

    protected abstract _invoke(...args: Parameters<T>): ReturnType<T>;

    public readonly [Symbol.toStringTag]: string = "CallableObject";
}
