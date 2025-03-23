import Exception from "./core.js";

/**
 * A class representing a generic exception that can be thrown when a file
 * operation fails, such as reading, writing, copying, moving, deleting, etc...
 *
 * It can also be used to catch all file-related exceptions at once.
 *
 * ---
 *
 * @example
 * ```ts
 * try { [...] }
 * catch (error)
 * {
 *     if (error instanceof FileException)
 *     {
 *         // A file-related exception occurred. Handle it...
 *     }
 * }
 * ```
 */
export class FileException extends Exception
{
    /**
     * Initializes a new instance of the {@link FileException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new FileException("An error occurred while trying to read the file.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"FileException"`.
     */
    public constructor(message: string, cause?: unknown, name = "FileException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "FileException";
}

/**
 * A class representing an exception that can be thrown when a file already exists.
 *
 * ---
 *
 * @example
 * ```ts
 * import { existsSync } from "node:fs";
 *
 * if (existsSync("file.txt"))
 * {
 *     throw new FileExistsException("The file named 'file.txt' already exists.");
 * }
 * ```
 */
export class FileExistsException extends FileException
{
    /**
     * Initializes a new instance of the {@link FileExistsException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new FileExistsException("The file named 'data.json' already exists on the server.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"FileExistsException"`.
     */
    public constructor(message: string, cause?: unknown, name = "FileExistsException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "FileExistsException";
}

/**
 * A class representing an exception that can be thrown when a file isn't found.
 *
 * ---
 *
 * @example
 * ```ts
 * import { existsSync } from "node:fs";
 *
 * if (!existsSync("file.txt"))
 * {
 *     throw new FileNotFoundException("The file named 'file.txt' wasn't found.");
 * }
 * ```
 */
export class FileNotFoundException extends FileException
{
    /**
     * Initializes a new instance of the {@link FileNotFoundException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new FileNotFoundException("The file named 'data.json' wasn't found on the server.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"FileNotFoundException"`.
     */
    public constructor(message: string, cause?: unknown, name = "FileNotFoundException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "FileNotFoundException";
}

/**
 * A class representing an exception that can be thrown when a key is invalid or not found.  
 * It's commonly used when working with dictionaries, maps, objects, sets, etc...
 *
 * ---
 *
 * @example
 * ```ts
 * const map = new Map<string, number>();
 * if (!map.has("hash"))
 * {
 *     throw new KeyException("The key 'hash' wasn't found in the collection.");
 * }
 * ```
 */
export class KeyException extends Exception
{
    /**
     * Initializes a new instance of the {@link KeyException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new KeyException("The 'id' key wasn't found in the dictionary.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"KeyException"`.
     */
    public constructor(message: string, cause?: unknown, name = "KeyException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "KeyException";
}

/**
 * A class representing an exception that can be thrown when a network operation fails.  
 * It's commonly used when it's unable to connect to a server or when a request times out.
 *
 * ---
 *
 * @example
 * ```ts
 * import axios, { isAxiosError } from "axios";
 *
 * try { await axios.get("https://api.example.com/data"); }
 * catch (error)
 * {
 *     if (isAxiosError(error) && !error.response)
 *     {
 *         throw new NetworkException(
 *             "Unable to establish a connection to the server. " +
 *             "Please, check your internet connection and try again."
 *         );
 *     }
 * }
 * ```
 */
export class NetworkException extends Exception
{
    /**
     * Initializes a new instance of the {@link NetworkException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new NetworkException("Couldn't connect to the server. Please, try again later.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"NetworkException"`.
     */
    public constructor(message: string, cause?: unknown, name = "NetworkException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "NetworkException";
}

/**
 * A class representing an exception that can be thrown when a permission is denied.  
 * It's commonly used when a user tries to access a restricted resource or perform a forbidden action.
 *
 * ---
 *
 * @example
 * ```ts
 * const $user = useUserStore();
 * if (!$user.isAdmin)
 * {
 *     throw new PermissionException("You don't have permission to perform this action.");
 * }
 * ```
 */
export class PermissionException extends Exception
{
    /**
     * Initializes a new instance of the {@link PermissionException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new PermissionException("You don't have permission to access this resource.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"PermissionException"`.
     */
    public constructor(message: string, cause?: unknown, name = "PermissionException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "PermissionException";
}

/**
 * A class representing an exception that can be thrown when a reference is invalid or not found.  
 * It's commonly used when a variable is `null`, `undefined` or when an object doesn't exist.
 *
 * ---
 *
 * @example
 * ```ts
 * const $el = document.getElementById("app");
 * if ($el === null)
 * {
 *     throw new ReferenceException("The element with the ID 'app' wasn't found in the document.");
 * }
 * ```
 */
export class ReferenceException extends Exception
{
    /**
     * Initializes a new instance of the {@link ReferenceException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new ReferenceException("The 'canvas' element wasn't found in the document.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"ReferenceException"`.
     */
    public constructor(message: string, cause?: unknown, name = "ReferenceException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "ReferenceException";
}

/**
 * A class representing an exception that can be thrown when a runtime error occurs.  
 * It's commonly used when an unexpected condition is encountered during the execution of a program.
 *
 * ---
 *
 * @example
 * ```ts
 * let status: "enabled" | "disabled" = "enabled";
 *
 * function enable(): void
 * {
 *     if (status === "enabled") { throw new RuntimeException("The feature is already enabled."); }
 *     status = "enabled";
 * }
 * ```
 */
export class RuntimeException extends Exception
{
    /**
     * Initializes a new instance of the {@link RuntimeException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new RuntimeException("The received input seems to be malformed or corrupted.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"RuntimeException"`.
     */
    public constructor(message: string, cause?: unknown, name = "RuntimeException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "RuntimeException";
}

/**
 * A class representing an exception that can be thrown when an environment
 * isn't properly configured or when a required variable isn't set.  
 * It can also be used when the environment on which the program is running is unsupported.
 *
 * ---
 *
 * @example
 * ```ts
 * if (!navigator.geolocation)
 * {
 *     throw new EnvironmentException("The Geolocation API isn't supported in this environment.");
 * }
 * ```
 */
export class EnvironmentException extends RuntimeException
{
    /**
     * Initializes a new instance of the {@link EnvironmentException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new EnvironmentException("The required environment variable 'API_KEY' isn't set.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"EnvironmentException"`.
     */
    public constructor(message: string, cause?: unknown, name = "EnvironmentException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "EnvironmentException";
}

/**
 * A class representing an exception that can be thrown when a timeout occurs.  
 * It's commonly used when a task takes too long to complete or when a request times out.
 *
 * ---
 *
 * @example
 * ```ts
 * const timeoutId = setTimeout(() => { throw new TimeoutException("The request timed out."); }, 5_000);
 * const response = await fetch("https://api.example.com/data");
 *
 * clearTimeout(timeoutId);
 * ```
 */
export class TimeoutException extends Exception
{
    /**
     * Initializes a new instance of the {@link TimeoutException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new TimeoutException("The task took too long to complete.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"TimeoutException"`.
     */
    public constructor(message: string, cause?: unknown, name = "TimeoutException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "TimeoutException";
}

/**
 * A class representing an exception that can be thrown when a type is invalid or not supported.  
 * It's commonly used when a function receives an unexpected type of argument.
 *
 * ---
 *
 * @example
 * ```ts
 * function greet(name: string): void
 * {
 *     if (typeof name !== "string")
 *     {
 *         throw new TypeException("The 'name' argument must be a valid string.");
 *     }
 * }
 * ```
 */
export class TypeException extends Exception
{
    /**
     * Initializes a new instance of the {@link TypeException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new TypeException("The 'username' argument must be a valid string.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"TypeException"`.
     */
    public constructor(message: string, cause?: unknown, name = "TypeException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "TypeException";
}

/**
 * A class representing an exception that can be thrown when a value is invalid.  
 * It's commonly used when a function receives an unexpected value as an argument.
 *
 * ---
 *
 * @example
 * ```ts
 * function setVolume(value: number): void
 * {
 *     if (value < 0)
 *     {
 *         throw new ValueException("The 'value' argument must be greater than or equal to 0.");
 *     }
 * }
 * ```
 */
export class ValueException extends Exception
{
    /**
     * Initializes a new instance of the {@link ValueException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new ValueException("The 'grade' argument cannot be negative.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"ValueException"`.
     */
    public constructor(message: string, cause?: unknown, name = "ValueException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "ValueException";
}

/**
 * A class representing an exception that can be thrown when a value is out of range.  
 * It's commonly used when a function receives an unexpected value as an argument.
 *
 * ---
 *
 * @example
 * ```ts
 * function setVolume(value: number): void
 * {
 *     if ((value < 0) || (value > 100))
 *     {
 *         throw new RangeException("The 'value' argument must be between 0 and 100.");
 *     }
 * }
 * ```
 */
export class RangeException extends ValueException
{
    /**
     * Initializes a new instance of the {@link RangeException} class.
     *
     * ---
     *
     * @example
     * ```ts
     * throw new RangeException("The 'percentage' argument must be between 0 and 100.");
     * ```
     *
     * ---
     *
     * @param message The message that describes the error.
     * @param cause The previous caught error that caused this one, if any.
     * @param name The name of the exception. Default is `"RangeException"`.
     */
    public constructor(message: string, cause?: unknown, name = "RangeException")
    {
        super(message, cause, name);
    }

    public override readonly [Symbol.toStringTag]: string = "RangeException";
}

export { Exception };
export { FatalErrorException, NotImplementedException } from "./core.js";
