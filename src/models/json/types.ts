export type JSONArray = JSONValue[];

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface JSONObject { [key: string]: JSONValue }
export type JSONValue = boolean | number | string | null | JSONObject | JSONArray;
