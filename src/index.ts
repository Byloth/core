export const VERSION = "2.0.0-rc.6";

export type { Constructor, Interval, Timeout } from "./core/types.js";

export { isBrowser, isNode, isWebWorker } from "./helpers.js";

export {
    AggregatedIterator,
    AggregatedAsyncIterator,
    Clock,
    Countdown,
    DeferredPromise,
    Exception,
    FatalErrorException,
    FileException,
    FileExistsException,
    FileNotFoundException,
    GameLoop,
    JSONStorage,
    KeyException,
    NotImplementedException,
    NetworkException,
    PermissionException,
    Publisher,
    RangeException,
    ReducedIterator,
    ReferenceException,
    RuntimeException,
    SmartIterator,
    SmartAsyncIterator,
    SmartPromise,
    Thenable,
    TimeoutException,
    TimedPromise,
    TypeException,
    ValueException

} from "./models/index.js";

export type {
    AsyncGeneratorFunction,
    AsyncIteratorLike,
    FulfilledHandler,
    GeneratorFunction,
    Iteratee,
    IteratorLike,
    JSONArray,
    JSONObject,
    JSONValue,
    KeyedIteratee,
    KeyedReducer,
    KeyedTypeGuardIteratee,
    MaybeAsyncKeyedIteratee,
    MaybeAsyncKeyedReducer,
    MaybeAsyncKeyedTypeGuardIteratee,
    MaybeAsyncReducer,
    MaybeAsyncIteratee,
    MaybeAsyncIteratorLike,
    MaybeAsyncTypeGuardIteratee,
    MaybePromise,
    PromiseExecutor,
    PromiseRejecter,
    PromiseResolver,
    Reducer,
    RejectedHandler,
    Subscriber,
    TypeGuardIteratee

} from "./models/types.js";

export {
    average,
    capitalize,
    chain,
    count,
    delay,
    dateDifference,
    dateRange,
    dateRound,
    TimeUnit,
    enumerate,
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
