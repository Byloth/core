/* eslint-disable @typescript-eslint/ban-ts-comment */

// @ts-ignore
export const isBrowser = ((typeof window !== "undefined") && (typeof window.document !== "undefined"));

// @ts-ignore
export const isNode = ((typeof process !== "undefined") && (process.versions?.node));

// @ts-ignore
export const isWebWorker = ((typeof self === "object") && (self.constructor?.name === "DedicatedWorkerGlobalScope"));
