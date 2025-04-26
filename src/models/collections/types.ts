export interface MapViewEventsMap<K, V>
{
    "key:set": (key: K, value: V) => void;
    "key:delete": (key: K) => void;

    "map:clear": () => void;
}

export interface SetViewEventsMap<T>
{
    "element:add": (value: T) => void;
    "element:delete": (value: T) => void;

    "set:clear": () => void;
}
