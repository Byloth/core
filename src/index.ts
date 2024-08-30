export const VERSION = "2.0.0-rc.1";

export type { Constructor, Interval, Timeout } from "./core/types.js";

export { isBrowser, isNode, isWebWorker } from "./helpers.js";

export {
    AggregatedIterator,
    AggregatedAsyncIterator,
    Aggregator,
    AsyncAggregator,
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
    TimeoutException,
    TimedPromise,
    TypeException,
    ValueException

} from "./models/index.js";

export type {
    AsyncGeneratorFunction,
    AsyncIterLike,
    FulfilledHandler,
    GeneratorFunction,
    Iteratee,
    IterLike,
    JSONArray,
    JSONObject,
    JSONValue,
    KeyIteratee,
    KeyReducer,
    KeyTypeGuardIteratee,
    MaybeAsyncKeyIteratee,
    MaybeAsyncKeyReducer,
    MaybeAsyncKeyTypeGuardIteratee,
    MaybeAsyncReducer,
    MaybeAsyncIteratee,
    MaybeAsyncIterLike,
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
