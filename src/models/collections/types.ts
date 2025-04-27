export interface MapViewEventsMap<K, V>
{
    "entry:add": (key: K, value: V) => void;
    "entry:remove": (key: K) => void;

    "collection:clear": () => void;
}
export interface ReadonlyMapView<K, V> extends ReadonlyMap<K, V>
{
    subscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): () => void;
    unsubscribe<T extends keyof MapViewEventsMap<K, V>>(event: T, callback: MapViewEventsMap<K, V>[T]): void;
}

export interface SetViewEventsMap<T>
{
    "entry:add": (value: T) => void;
    "entry:remove": (value: T) => void;

    "collection:clear": () => void;
}
export interface ReadonlySetView<T> extends ReadonlySet<T>
{
    subscribe<K extends keyof SetViewEventsMap<T>>(event: K, callback: SetViewEventsMap<T>[K]): () => void;
    unsubscribe<K extends keyof SetViewEventsMap<T>>(event: K, callback: SetViewEventsMap<T>[K]): void;
}
