export default class Thenable<T> implements Promise<T>
{
    protected _onFulfilled: (result: T) => T;
    protected _resolve(result: T): T
    {
        return this._onFulfilled(result);
    }

    public constructor()
    {
        this._onFulfilled = (result: T) => result;
    }

    public then(onFulfilled?: null): Thenable<T>;
    public then<F = T>(onFulfilled: (result: T) => F, onRejected?: null): Thenable<F>;
    public then<F = T, R = never>(onFulfilled: (result: T) => F, onRejected: (reason: unknown) => R)
        : Thenable<F | R>;
    public then<F = T, R = never>(onFulfilled?: ((result: T) => F) | null, onRejected?: ((reason: unknown) => R) | null)
        : Thenable<F | R>
    {
        if (onRejected)
        {
            const _previousOnFulfilled = this._onFulfilled;
            this._onFulfilled = (result: T) =>
            {
                try
                {
                    result = _previousOnFulfilled(result);

                    return (onFulfilled!(result) as unknown) as T;
                }
                catch (error)
                {
                    return (onRejected(error) as unknown) as T;
                }
            };
        }
        else if (onFulfilled)
        {
            const _previousOnFulfilled = this._onFulfilled;
            this._onFulfilled = (result: T) =>
            {
                result = _previousOnFulfilled(result);

                return (onFulfilled(result) as unknown) as T;
            };
        }

        return (this as unknown) as Thenable<F | R>;
    }

    public catch(onRejected?: null): Thenable<T>;
    public catch<R = never>(onRejected: (reason: unknown) => R): Thenable<T | R>;
    public catch<R = never>(onRejected?: ((reason: unknown) => R) | null): Thenable<T | R>
    {
        if (onRejected)
        {
            const _previousOnFulfilled = this._onFulfilled;
            this._onFulfilled = (result) =>
            {
                try
                {
                    return _previousOnFulfilled(result);
                }
                catch (error)
                {
                    return (onRejected(error) as unknown) as T;
                }
            };
        }

        return this as Thenable<T | R>;
    }

    public finally(onFinally?: (() => void) | null): Thenable<T>
    {
        if (onFinally)
        {
            const _previousOnFulfilled = this._onFulfilled;
            this._onFulfilled = (result) =>
            {
                try
                {
                    return _previousOnFulfilled(result);
                }
                finally
                {
                    onFinally();
                }
            };
        }

        return this;
    }

    public readonly [Symbol.toStringTag]: string = "Thenable";
}
