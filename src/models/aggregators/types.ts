export type KeyIteratee<T, K extends PropertyKey, R = void> = (key: K, value: T, index: number) => R;
export type KeyReducer<T, K extends PropertyKey, A> = (key: K, accumulator: A, value: T, index: number) => A;
