export type JSONArray = JSONValue[];

// @ts-expect-error - This is a circular reference to itself.
export type JSONObject = Record<string, JSONValue>;

// @ts-expect-error - This is a circular reference to itself.
export type JSONValue = boolean | number | string | null | JSONObject | JSONArray;
