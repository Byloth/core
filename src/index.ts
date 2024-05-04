export const VERSION = "1.5.0-rc.1";

export {
    AggregatedIterator,
    Aggregator,
    DeferredPromise,
    Exception,
    JsonStorage,
    ReducedIterator,
    ReferenceException,
    SmartIterator,
    SmartPromise,
    Subscribers,
    TimedPromise,
    TimeoutException

} from "./models/index.js";
export type { KeyIteratee, KeyReducer, KeyTypeGuardIteratee } from "./models/index.js";

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
    Random,
    range,
    shuffle,
    sum,
    unique,
    zip

} from "./utils/index.js";

export type {
    AsyncGeneratorFunction,
    Constructor,
    FulfilledHandler,
    GeneratorFunction,
    Interval,
    Iteratee,
    MaybePromise,
    PromiseExecutor,
    PromiseRejecter,
    PromiseResolver,
    Reducer,
    RejectedHandler,
    Timeout,
    TypeGuardIteratee

} from "./types.js";
