export const VERSION = "2.0.1";

export type { Constructor, Interval, Timeout } from "./core/types.js";

export { isBrowser, isNode, isWorker } from "./helpers.js";

export {
    AggregatedIterator,
    AggregatedAsyncIterator,
    CallableObject,
    Clock,
    Countdown,
    DeferredPromise,
    EnvironmentException,
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
    AsyncIteratee,
    AsyncIteratorLike,
    AsyncKeyedIteratee,
    AsyncKeyedReducer,
    AsyncReducer,
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
    KeyedTypeGuardPredicate,
    MaybeAsyncKeyedIteratee,
    MaybeAsyncKeyedReducer,
    MaybeAsyncGeneratorFunction,
    MaybeAsyncIteratee,
    MaybeAsyncIteratorLike,
    MaybeAsyncReducer,
    MaybePromise,
    PromiseExecutor,
    PromiseRejecter,
    PromiseResolver,
    Reducer,
    RejectedHandler,
    TypeGuardPredicate

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
    getWeek,
    hash,
    loadScript,
    nextAnimationFrame,
    Random,
    range,
    shuffle,
    sum,
    unique,
    WeekDay,
    yieldToEventLoop,
    zip

} from "./utils/index.js";
