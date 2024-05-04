import { ReferenceException } from "./exceptions/index.js";

export default class Subscribers<P extends unknown[] = [], R = void, T extends (...args: P) => R = (...args: P) => R>
{
    protected _subscribers: T[];

    public constructor()
    {
        this._subscribers = [];
    }

    public add(subscriber: T): void
    {
        this._subscribers.push(subscriber);
    }
    public remove(subscriber: T): void
    {
        const index = this._subscribers.indexOf(subscriber);
        if (index < 0)
        {
            throw new ReferenceException("Unable to remove the requested subscriber. It was not found.");
        }

        this._subscribers.splice(index, 1);
    }

    public call(...args: P): R[]
    {
        return this._subscribers
            .slice()
            .map((subscriber) => subscriber(...args));
    }

    public get [Symbol.toStringTag]() { return "Subscribers"; }
}
