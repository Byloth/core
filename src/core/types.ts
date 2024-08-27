// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T extends object, P extends unknown[] = any[]> = new (...args: P) => T;

export type Interval = ReturnType<typeof setInterval>;
export type Timeout = ReturnType<typeof setTimeout>;

export type JSONValue = boolean | number | string | null | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];
