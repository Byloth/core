export const VERSION = "1.1.5";

export { DeferredPromise, Exception, JsonStorage, Subscribers } from "./models/index.js";
export {
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
    sum,
    unique

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
