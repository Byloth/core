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
}
