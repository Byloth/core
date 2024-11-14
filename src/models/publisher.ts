import { ReferenceException } from "./exceptions/index.js";

export type Subscriber<A extends unknown[] = [], R = void> = (...args: A) => R;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export default class Publisher<T extends { [K in keyof T]: [unknown[], unknown] } = Record<string, [[], void]>>
{
    protected _subscribers: Map<keyof T, Subscriber<unknown[], unknown>[]>;

    public constructor()
    {
        this._subscribers = new Map();
    }

    public subscribe<K extends keyof T, A extends T[K][0], R extends T[K][1]>(event: K, subscriber: Subscriber<A, R>)
        : () => void
    {
        if (!(this._subscribers.has(event))) { this._subscribers.set(event, []); }

        const subscribers = this._subscribers.get(event)!;
        subscribers.push(subscriber as Subscriber<unknown[], unknown>);

        return () =>
        {
            const index = subscribers.indexOf(subscriber as Subscriber<unknown[], unknown>);
            if (index < 0)
            {
                throw new ReferenceException("Unable to unsubscribe the required subscriber. " +
                    "The subscription was already unsubscribed.");
            }

            subscribers.splice(index, 1);
        };
    }

    public publish<K extends keyof T, A extends T[K][0], R extends T[K][1]>(event: K, ...args: A): R[]
    {
        const subscribers = this._subscribers.get(event);
        if (!(subscribers)) { return []; }

        return subscribers.slice()
            .map((subscriber) => subscriber(...args)) as R[];
    }

    public readonly [Symbol.toStringTag]: string = "Publisher";
}
