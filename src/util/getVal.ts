
/**
 * Generic helper function that will return the value from a key iff the key
 * type is an index of T and the value for the key exists, returns undefined
 * otherwise.
 */
export function getVal<T, K extends keyof T>(arr: T, key: K): T[K] | undefined {
    return arr[key] !== undefined ? arr[key] : undefined;
}
