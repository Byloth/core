import type { PromiseExecutor, PromiseResolver, PromiseRejecter } from "@/types/promise";

export default class DeferredPromise<T, E = unknown> extends Promise<T>
{
    protected _resolve: PromiseResolver<T>;
    protected _reject: PromiseRejecter<E>;

    public get resolve(): PromiseResolver<T>
    {
        return this._resolve;
    }
    public get reject(): PromiseRejecter<E>
    {
        return this._reject;
    }

    public constructor(executor: PromiseExecutor<T>)
    {
        let resolve: PromiseResolver<T>;
        let reject: PromiseRejecter<E>;

        super((res, rej) =>
        {
            this._resolve = res;
            this._reject = rej;

            executor(res, rej);
        });

        this._resolve = resolve!;
        this._reject = reject!;
    }
}
