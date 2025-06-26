import type { Constructor } from "../../core/types.js";

export type ErrorHandler<E, R> = (error: E) => R;
export interface ExceptionMap<E extends Error, R>
{
    type: Constructor<E>;
    handler: ErrorHandler<E, R>;
}
