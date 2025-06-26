import type { Constructor } from "../../core/types.js";
import CallableObject from "../callbacks/callable-object.js";

import type { ErrorHandler, ExceptionMap } from "./types.js";

const NoOp = () => { /* ... */ };
const Thrower = (error: unknown): never => { throw error; };

export default class ExceptionHandler<T = never, D = never, C = never>
    extends CallableObject<ErrorHandler<unknown, T | D | C>>
{
    protected readonly _handlers: ExceptionMap<Error, unknown>[];

    protected _default: ErrorHandler<unknown, D>;
    protected _catch: ErrorHandler<unknown, C>;

    public constructor()
    {
        super();

        this._handlers = [];

        this._default = Thrower;
        this._catch = Thrower;
    }

    protected override _invoke(error: unknown): T | D | C
    {
        try
        {
            for (const { type, handler } of this._handlers)
            {
                if (error instanceof type)
                {
                    return handler(error) as T;
                }
            }

            return this._default(error) as D;
        }
        catch (e)
        {
            if (error instanceof Error) { error = error.stack; }
            if (e instanceof Error)
            {
                e.stack += `\n\nOccurred while handling a ${error}`;
            }
            else
            {
                /* eslint-disable no-ex-assign */

                e = `${e}\n\nOccurred while handling a ${error}`;
            }

            return this._catch(e) as C;
        }
    }

    public default<R>(handler: ErrorHandler<Error, R>): ExceptionHandler<T, R, C>
    {
        this._default = (handler as unknown) as ErrorHandler<unknown, D>;

        return (this as unknown) as ExceptionHandler<T, R, C>;
    }
    public catch<R>(handler: ErrorHandler<Error, R>): ExceptionHandler<T, D, R>
    {
        this._catch = (handler as unknown) as ErrorHandler<unknown, C>;

        return (this as unknown) as ExceptionHandler<T, D, R>;
    }

    public on<E extends Error, R>(type: Constructor<E>, handler: ErrorHandler<E, R>): ExceptionHandler<T | R, D, C>;
    public on<E extends Error, R>(types: Constructor<E>[], handler: ErrorHandler<E, R>): ExceptionHandler<T | R, D, C>;
    public on<E extends Error, R>(types: Constructor<E> | Constructor<E>[], handler: ErrorHandler<E, R>)
        : ExceptionHandler<T | R, D, C>
    {
        if (Array.isArray(types))
        {
            for (const type of types)
            {
                this._handlers.push({
                    type: type,
                    handler: handler as ErrorHandler<Error, unknown>
                });
            }
        }
        else
        {
            this._handlers.push({
                type: types,
                handler: handler as ErrorHandler<Error, unknown>
            });
        }

        return this;
    }

    public ignore<E extends Error>(type: Constructor<E>): ExceptionHandler<T | void, D, C>;
    public ignore<E extends Error>(types: Constructor<E>[]): ExceptionHandler<T | void, D, C>;
    public ignore<E extends Error>(types: Constructor<E> | Constructor<E>[]): ExceptionHandler<T | void, D, C>
    {
        return this.on(types as Constructor<E>[], NoOp);
    }

    public override readonly [Symbol.toStringTag]: string = "ExceptionHandler";
}
