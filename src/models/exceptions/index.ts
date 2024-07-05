import Exception from "./core.js";

export class FileNotFoundException extends Exception
{
    public constructor(message: string, cause?: unknown, name = "FileNotFoundException")
    {
        super(message, cause, name);
    }

    public get [Symbol.toStringTag]() { return "FileNotFoundException"; }
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

export { Exception };
export { FatalErrorException, NotImplementedException } from "./core.js";
