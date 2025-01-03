export const VERSION = "2.0.0-rc.12";

export type { Constructor, Interval, Timeout } from "./core/types.js";

export { isBrowser, isNode, isWebWorker } from "./helpers.js";

export {
    AggregatedIterator,
    AggregatedAsyncIterator,
    CallableObject,
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
    SwitchableCallback,
    TimeoutException,
    TimedPromise,
    TypeException,
    ValueException

} from "./models/index.js";

export type {
    AsyncGeneratorFunction,
    AsyncIteratorLike,
    Callback,
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
    MaybeAsyncGeneratorFunction,
    MaybeAsyncIteratee,
    MaybeAsyncIteratorLike,
    MaybeAsyncReducer,
    MaybeAsyncTypeGuardIteratee,
    MaybePromise,
    PromiseExecutor,
    PromiseRejecter,
    PromiseResolver,
    Reducer,
    RejectedHandler,
    TypeGuardIteratee

} from "./models/types.js";

export {
    average,
    capitalize,
    chain,
    count,
    Curve,
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
    yieldToEventLoop,
    zip

} from "./utils/index.js";
