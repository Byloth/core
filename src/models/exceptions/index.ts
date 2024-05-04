import Exception from "./core.js";

export class ReferenceException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "ReferenceException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "ReferenceException"; }
}
export class TimeoutException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "TimeoutException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "TimeoutException"; }
}

export { Exception };
