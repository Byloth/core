import { ReferenceException } from "../exceptions/index.js";

import type { Callback } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class Publisher<T extends { [K in keyof T]: Callback<any[], any> } = Record<string, Callback>>
{
    protected _subscribers: Map<keyof T, Callback<unknown[], unknown>[]>;

    public constructor()
    {
        this._subscribers = new Map();
    }

    public clear(): void
    {
        this._subscribers.clear();
    }

    public publish<K extends keyof T>(event: K, ...args: Parameters<T[K]>): ReturnType<T[K]>[]
    {
        const subscribers = this._subscribers.get(event);
        if (!(subscribers)) { return []; }

        return subscribers.slice()
            .map((subscriber) => subscriber(...args)) as ReturnType<T[K]>[];
    }

    public subscribe<K extends keyof T>(event: K, subscriber: T[K]): () => void
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
    public unsubscribe<K extends keyof T>(event: K, subscriber: T[K]): void
    {
        const subscribers = this._subscribers.get(event);
        if (!(subscribers)) { return; }

        const index = subscribers.indexOf(subscriber);
        if (index < 0)
        {
            throw new ReferenceException("Unable to unsubscribe the required subscriber. " +
                "The subscription was already unsubscribed or was never subscribed.");
        }

        subscribers.splice(index, 1);
    }

    public readonly [Symbol.toStringTag]: string = "Publisher";
}
