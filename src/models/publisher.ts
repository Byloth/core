import { ReferenceException } from "./exceptions/index.js";

export type Subscriber<A extends unknown[] = [], R = void> = (...args: A) => R;

export default class Publisher<A extends unknown[] = [], R = void>
{
    protected _subscribers: Subscriber<A, R>[];

    public constructor()
    {
        this._subscribers = [];
    }

    public subscribe(subscriber: Subscriber<A, R>): () => void
    {
        this._subscribers.push(subscriber);

        return () =>
        {
            const index = this._subscribers.indexOf(subscriber);
            if (index < 0)
            {
                throw new ReferenceException("Unable to unsubscribe the required subscriber. " +
                    "The subscription was already unsubscribed.");
            }

            this._subscribers.splice(index, 1);
        };
    }

    public publish(...args: A): R[]
    {
        return this._subscribers
            .slice()
            .map((subscriber) => subscriber(...args));
    }

    public readonly [Symbol.toStringTag]: string = "Publisher";
}
