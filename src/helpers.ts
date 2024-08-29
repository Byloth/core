export const isBrowser = ((typeof window !== "undefined") && (typeof window.document !== "undefined"));
export const isNode = ((typeof process !== "undefined") && (process.versions?.node));
export const isWebWorker = ((typeof self === "object") && (self.constructor?.name === "DedicatedWorkerGlobalScope"));
