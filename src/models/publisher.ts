import { ReferenceException } from "./exceptions/index.js";

export type Subscriber<A extends unknown[] = [], R = void> = (...args: A) => R;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class Publisher<T extends { [K in keyof T]: Subscriber<any[], any> } = Record<string, Subscriber>>
{
    protected _subscribers: Map<keyof T, Subscriber<unknown[], unknown>[]>;

    public constructor()
    {
        this._subscribers = new Map();
    }

    public subscribe<K extends keyof T, S extends T[K]>(event: K, subscriber: S)
        : () => void
    {
        if (!(this._subscribers.has(event))) { this._subscribers.set(event, []); }

        const subscribers = this._subscribers.get(event)!;
        subscribers.push(subscriber);

        return () =>
        {
            const index = subscribers.indexOf(subscriber);
            if (index < 0)
            {
                throw new ReferenceException("Unable to unsubscribe the required subscriber. " +
                    "The subscription was already unsubscribed.");
            }

            subscribers.splice(index, 1);
        };
    }

    public publish<K extends keyof T, A extends Parameters<T[K]>, R extends ReturnType<T[K]>>(event: K, ...args: A): R[]
    {
        const subscribers = this._subscribers.get(event);
        if (!(subscribers)) { return []; }

        return subscribers.slice()
            .map((subscriber) => subscriber(...args)) as R[];
    }

    public readonly [Symbol.toStringTag]: string = "Publisher";
}
