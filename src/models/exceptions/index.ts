import Exception from "./core.js";

export class FileException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "FileException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "FileException";
}
export class FileExistsException extends FileException
{
    public constructor(message: string, cause?: unknown, name = "FileExistsException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "FileExistsException";
}
export class FileNotFoundException extends FileException
{
    public constructor(message: string, cause?: unknown, name = "FileNotFoundException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "FileNotFoundException";
}

export class KeyException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "KeyException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "KeyException";
}
export class NetworkException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "NetworkException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "NetworkException";
}
export class PermissionException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "PermissionException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "PermissionException";
}
export class ReferenceException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "ReferenceException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "ReferenceException";
}

export class RuntimeException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "RuntimeException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "RuntimeException";
}
export class EnvironmentException extends RuntimeException
{
    public constructor(message: string, cause?: unknown, name = "EnvironmentException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "EnvironmentException";
}

export class TimeoutException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "TimeoutException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "TimeoutException";
}
export class TypeException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "TypeException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "TypeException";
}

export class ValueException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "ValueException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "ValueException";
}
export class RangeException extends ValueException
{
    public constructor(message: string, cause?: unknown, name = "RangeException")
    {
        super(message, cause, name);
    }

    public readonly [Symbol.toStringTag]: string = "RangeException";
}

export { Exception };
export { FatalErrorException, NotImplementedException } from "./core.js";
