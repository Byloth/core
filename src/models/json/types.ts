export type JSONArray = JSONValue[];
export type JSONObject = { [key: string]: JSONValue };
export type JSONValue = boolean | number | string | null | JSONObject | JSONArray;
