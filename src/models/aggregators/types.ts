export type KeyIteratee<K extends PropertyKey, T, R = void> = (key: K, value: T, index: number) => R;
export type KeyReducer<K extends PropertyKey, T, A> = (key: K, accumulator: A, value: T, index: number) => A;
