/**
 * A type that represents a JSON array.
 */
export type JSONArray = JSONValue[];

/**
 * A type that represents a JSON object.
 */
export type JSONObject<T extends object = object> = { [K in keyof T]: JSONValue };

/**
 * A type that represents all the possible values of a JSON value.
 */
export type JSONValue = boolean | number | string | null | JSONObject | JSONArray;
