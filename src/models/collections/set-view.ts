import Publisher from "../callbacks/publisher.js";
import type { SetViewEventsMap } from "./types.js";

export interface ReadonlySetView<T> extends ReadonlySet<T>
{
    subscribe<K extends keyof SetViewEventsMap<T>>(event: K, callback: SetViewEventsMap<T>[K]): () => void;
    unsubscribe<K extends keyof SetViewEventsMap<T>>(event: K, callback: SetViewEventsMap<T>[K]): void;
}

export default class SetView<T> extends Set<T>
{
    protected readonly _publisher: Publisher<SetViewEventsMap<T>>;

    public constructor(iterable?: Iterable<T> | null)
    {
        super(iterable);

        this._publisher = new Publisher();
    }

    public override add(value: T): this
    {
        super.add(value);

        this._publisher.publish("element:add", value);

        return this;
    }
    public override delete(value: T): boolean
    {
        const result = super.delete(value);
        if (result) { this._publisher.publish("element:delete", value); }

        return result;
    }

    public override clear(): void
    {
        const size = this.size;

        super.clear();
        if (size > 0) { this._publisher.publish("set:clear"); }
    }

    public subscribe<K extends keyof SetViewEventsMap<T>>(event: K, callback: SetViewEventsMap<T>[K]): () => void
    {
        return this._publisher.subscribe(event, callback);
    }
    public unsubscribe<K extends keyof SetViewEventsMap<T>>(event: K, callback: SetViewEventsMap<T>[K]): void
    {
        this._publisher.unsubscribe(event, callback);
    }
}
