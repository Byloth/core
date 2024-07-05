export const VERSION = "1.5.0-rc.7";

export type { Constructor, Interval, Timeout } from "./core/types.js";

export {
    AggregatedIterator,
    AggregatedAsyncIterator,
    Aggregator,
    AsyncAggregator,
    DeferredPromise,
    Exception,
    FatalErrorException,
    FileNotFoundException,
    JsonStorage,
    ReducedIterator,
    RuntimeException,
    SmartIterator,
    SmartAsyncIterator,
    SmartPromise,
    Subscribers,
    TimeoutException,
    TimedPromise,
    TypeException,
    ValueException

} from "./models/index.js";

export type {
    GeneratorFunction,
    AsyncGeneratorFunction,
    Iteratee,
    MaybeAsyncIteratee,
    TypeGuardIteratee,
    MaybeAsyncTypeGuardIteratee,
    Reducer,
    MaybeAsyncReducer,
    MaybePromise,
    FulfilledHandler,
    RejectedHandler,
    PromiseResolver,
    PromiseRejecter,
    PromiseExecutor

} from "./models/types.js";

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
