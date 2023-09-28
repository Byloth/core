export const VERSION = "1.0.2";

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

export type { MaybePromise, PromiseExecutor, PromiseResolver, PromiseRejecter } from "./types";
