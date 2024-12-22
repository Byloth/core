/**
 * A type representing a JSON array.
 */
export type JSONArray = JSONValue[];

/**
 * A type representing a JSON object.
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface JSONObject { [key: string]: JSONValue }

/**
 * A type representing all the possible values of a JSON value.
 */
export type JSONValue = boolean | number | string | null | JSONObject | JSONArray;
