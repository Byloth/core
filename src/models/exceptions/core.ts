export default class Exception extends Error
{
    public static FromUnknown(error: unknown): Exception
    {
        if (error instanceof Exception)
        {
            return error;
        }
        if (error instanceof Error)
        {
            const exc = new Exception(error.message);

            exc.stack = error.stack;
            exc.name = error.name;

            return exc;
        }

        return new Exception(`${error}`);
    }

    public constructor(message: string, cause?: unknown, name = "Exception")
    {
        super(message);

        this.cause = cause;
        this.name = name;

        if (cause)
        {
            if (cause instanceof Error)
            {
                this.stack += `\n\nCaused by ${cause.stack}`;
            }
            else
            {
                this.stack += `\n\nCaused by ${cause}`;
            }
        }
    }

    public get [Symbol.toStringTag]() { return "Exception"; }
}

export class FatalErrorException extends Exception
{
    public constructor(message?: string, cause?: unknown, name = "FatalErrorException")
    {
        if (message === undefined)
        {
            message = "The routine has encountered an unrecoverable error and cannot continue as expected. " +
                "Please, refresh the page and try again. If the problem persists, contact the support team.";
        }

        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "FatalErrorException"; }
}

export class NotImplementedException extends Exception
{
    public constructor(message?: string, cause?: unknown, name = "NotImplementedException")
    {
        if (message === undefined)
        {
            message = "This feature is not implemented yet. Please, try again later.";
        }

        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "NotImplementedException"; }
}
