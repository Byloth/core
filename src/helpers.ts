/* eslint-disable @typescript-eslint/ban-ts-comment */

/**
 * An utility constant that indicates whether the current environment is a browser.
 */
// @ts-ignore
export const isBrowser = ((typeof window !== "undefined") && (typeof window.document !== "undefined"));

/**
 * An utility constant that indicates whether the current environment is a Node.js runtime.
 */
// @ts-ignore
export const isNode = ((typeof process !== "undefined") && !!(process.versions?.node));

/**
 * An utility constant that indicates whether the current environment is a Web Worker.
 */
// @ts-ignore
export const isWorker = ((typeof self === "object") && (self.constructor?.name === "DedicatedWorkerGlobalScope"));
