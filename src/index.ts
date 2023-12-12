export const VERSION = "1.1.8";

export { DeferredPromise, Exception, JsonStorage, Subscribers } from "./models/index.js";
export {
    average,
    capitalize,
    count,
    delay,
    dateDifference,
    dateRange,
    dateRound,
    DateUnit,
    hash,
    loadScript,
    nextAnimationFrame,
    random,
    range,
    shuffle,
    sum,
    unique,
    zip

} from "./utils/index.js";

export type {
    Constructor,
    FulfilledHandler,
    MaybePromise,
    PromiseExecutor,
    PromiseRejecter,
    PromiseResolver,
    RejectedHandler

} from "./types.js";
