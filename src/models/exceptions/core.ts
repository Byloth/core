/**
 * A class representing an exception, subclass of the native `Error` class.  
 * It's the base class for any other further exception.
 *
 * It allows to chain exceptions together, tracking the initial cause of an error and
 * storing its stack trace while providing a clear and friendly message to the user.
 *
 * ---
 *
 * @example
 * ```ts
 * try { loadGameSaves(); }
 * catch (error)
 * {
 *     throw new Exception("The game saves may be corrupted. Try to restart the game.", error);
 *     // Uncaught Exception: The game saves may be corrupted. Try to restart the game.
 *     //     at /src/game/index.ts:37:15
 *     //     at /src/main.ts:23:17
 *     //
 *     // Caused by SyntaxError: Unexpected end of JSON input
 *     //     at /src/models/saves.ts:47:17
 *     //     at /src/game/index.ts:12:9
 *     //     at /src/main.ts:23:17
 * }
 * ```
 */
export default class Exception extends Error
{
    /**
     * A static method to convert a generic caught error, ensuring it's an instance of the {@link Exception} class.
     *
     * ---
     *
     * @example
     * ```ts
     * try { [...] }
     * catch (error)
     * {
     *     const exc = Exception.FromUnknown(error);
     *
     *     [...]
     * }
     * ```
     *
     * ---
     *
     * @param error The caught error to convert.
     *
     * @returns An instance of the {@link Exception} class.
     */
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

    /**
     * Initializes a new instance of the {@link Exception} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new Exception("An error occurred while processing the request.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"Exception"`.
     */
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

    public readonly [Symbol.toStringTag]: string = "Exception";
}

/**
 * An utility class representing that kind of situation where the program should never reach.  
 * Also commonly used to satisfy the type-system, but not part of a real feasible scenario.
 *
 * It provides a clear and friendly message by default.
 *
 * ---
 *
 * @example
 * ```ts
 * function checkCase(value: "A" | "B" | "C"): 1 | 2 | 3
 * {
 *     switch (value)
 *     {
 *         case "A": return 1;
 *         case "B": return 2;
 *         case "C": return 3;
 *         default: throw new FatalErrorException();
 *     }
 * }
 * ```
 */
export class FatalErrorException extends Exception
{
    /**
     * Initializes a new instance of the {@link FatalErrorException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new FatalErrorException("This error should never happen. Please, contact the support team.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"FatalErrorException"`.
     */
    public constructor(message?: string, cause?: unknown, name = "FatalErrorException")
    {
        if (message === undefined)
        {
            message = "The program has encountered an unrecoverable error and cannot continue as expected. " +
                "Please, try again later. If the problem persists, contact the support team.";
        }

        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "FatalErrorException";
}

/**
 * An utility class representing a situation where a feature isn't implemented yet.  
 * It's commonly used as a placeholder for future implementations.
 *
 * It provides a clear and friendly message by default.
 *
 * ---
 *
 * @example
 * ```ts
 * class Database
 * {
 *     public async connect(): Promise<void>
 *     {
 *         throw new NotImplementedException();
 *     }
 * }
 * ```
 */
export class NotImplementedException extends FatalErrorException
{
    /**
     * Initializes a new instance of the {@link NotImplementedException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new NotImplementedException("This method hasn't been implemented yet. Check back later.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"NotImplementedException"`.
     */
    public constructor(message?: string, cause?: unknown, name = "NotImplementedException")
    {
        if (message === undefined)
        {
            message = "This feature isn't implemented yet. Please, try again later.";
        }

        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "NotImplementedException";
}
