import Exception from "./core.js";

export class FileException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "FileException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "FileException"; }
}
export class FileExistsException extends FileException
{
    public constructor(message: string, cause?: unknown, name = "FileExistsException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "FileExistsException"; }
}
export class FileNotFoundException extends FileException
{
    public constructor(message: string, cause?: unknown, name = "FileNotFoundException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "FileNotFoundException"; }
}

export class KeyException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "KeyException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "KeyException"; }
}
export class NetworkException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "NetworkException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "NetworkException"; }
}
export class PermissionException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "PermissionException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "PermissionException"; }
}
export class ReferenceException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "ReferenceException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "ReferenceException"; }
}

export class RuntimeException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "RuntimeException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "RuntimeException"; }
}
export class EnvironmentException extends RuntimeException
{
    public constructor(message: string, cause?: unknown, name = "EnvironmentException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "EnvironmentException"; }
}

export class TimeoutException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "TimeoutException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "TimeoutException"; }
}
export class TypeException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "TypeException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "TypeException"; }
}

export class ValueException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "ValueException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "ValueException"; }
}
export class RangeException extends ValueException
{
    public constructor(message: string, cause?: unknown, name = "RangeException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "RangeException"; }
}

export { Exception };
export { FatalErrorException, NotImplementedException } from "./core.js";
