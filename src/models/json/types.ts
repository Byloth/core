/**
 * A type that represents a JSON array.
 */
export type JSONArray = JSONValue[];

/**
 * A type that represents a JSON object.
 */
export interface JSONObject { [key: string]: JSONValue }

/**
 * A type that represents all the possible values of a JSON value.
 */
export type JSONValue = boolean | number | string | null | JSONObject | JSONArray;
