export type MaybePromise<T> = T | PromiseLike<T>;

export type PromiseResolver<T = void> = (result: MaybePromise<T>) => void;
export type PromiseRejecter<E = unknown> = (error: E) => void;

export type PromiseExecutor<T = void, E = unknown> = (resolve: PromiseResolver<T>, reject: PromiseRejecter<E>) => void;
