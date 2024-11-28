/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Callback } from "./types.js";

export const SmartFunction = (Function as unknown) as
    new<T extends Callback<any[], any> = () => void>(...args: string[]) =>
        (...args: Parameters<T>) => ReturnType<T>;

export default abstract class CallableObject<T extends Callback<any[], any> = () => void>
    extends SmartFunction<T>
{
    public constructor()
    {
        super(`return this.invoke(...arguments);`);

        const self = this.bind(this);
        Object.setPrototypeOf(this, self);

        return self as this;
    }

    public abstract invoke(...args: Parameters<T>): ReturnType<T>;
}
