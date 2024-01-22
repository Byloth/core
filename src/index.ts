export const VERSION = "1.2.1-rc.1";

export {
    AggregatedIterator,
    Aggregator,
    DeferredPromise,
    Exception,
    JsonStorage,
    ReducedIterator,
    SmartIterator,
    Subscribers

} from "./models/index.js";

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
    GeneratorFunction,
    Iteratee,
    MaybePromise,
    PromiseExecutor,
    PromiseRejecter,
    PromiseResolver,
    Reducer,
    RejectedHandler

} from "./types.js";
