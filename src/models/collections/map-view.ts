import Publisher from "../callbacks/publisher.js";
import type { MapViewEventsMap } from "./types.js";

export interface ReadonlyMapView<K, V> extends ReadonlyMap<K, V>
{
    subscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): () => void;
    unsubscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): void;
}

export class MapView<K, V> extends Map<K, V>
{
    protected readonly _publisher: Publisher<MapViewEventsMap<K, V>>;

    public constructor(iterable?: Iterable<[K, V]> | null)
    {
        super(iterable);

        this._publisher = new Publisher();
    }

    public override set(key: K, value: V): this
    {
        super.set(key, value);

        this._publisher.publish("key:set", key, value);

        return this;
    }
    public override delete(key: K): boolean
    {
        const result = super.delete(key);
        if (result) { this._publisher.publish("key:delete", key); }

        return result;
    }

    public override clear(): void
    {
        const size = this.size;

        super.clear();
        if (size > 0) { this._publisher.publish("map:clear"); }
    }

    public subscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): () => void
    {
        return this._publisher.subscribe(event, callback);
    }
    public unsubscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): void
    {
        this._publisher.unsubscribe(event, callback);
    }
}
