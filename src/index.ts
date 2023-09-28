export const VERSION = "1.0.1";

export { DeferredPromise, JsonStorage } from "./models";
export {
    capitalize,
    count,
    delay,
    hash,
    loadScript,
    nextAnimationFrame,
    range,
    sum,
    unique
} from "./utils";

export type { Awaitable, PromiseExecutor, PromiseResolver, PromiseRejecter } from "./types";
