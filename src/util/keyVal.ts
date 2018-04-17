
/**
 * Generic helper function that will return the value from a key iff the key
 * type is an index of T and the value for the key exists, returns undefined
 * otherwise.
 */
export function getVal<T, K extends keyof T>(arr: T, key: K): T[K] | undefined {
    return arr[key] !== undefined ? arr[key] : undefined;
}

/**
 * A Generic helper that will return true if the property is deletable.
 */
export function deleteVal<T, K extends keyof T>(arr: T, key: K): boolean {
    // The delete operator will always return true unless the object's
    // configurable property is set to false.
    return arr.hasOwnProperty(key) ? delete arr[key] : false;
}
/**
 * A generic method that will return a copy of the arr given.
 */
export function copyVal<T>(arr: T): T {
    const R = {} as T;
    for (const i in arr) {
        if (arr.hasOwnProperty(i)) {
            R[i] = arr[i];
        }
    }
    return R;
}
export function copyMap<T, K>(map: Map<T, K>): Map<T, K> {
    const R: Map<T, K> = new Map<T, K>();
    map.forEach((value, key) => {
        R.set(key, value);
    });
    return R;
}
/**
 * A generic copy then delete function. Will return null if the key does
 * not exist in arr.
 */
export function safeDelete<T, K>(arr: Map<T, K>, key: K): Map<T, K> | null {
    // if (!arr.hasOwnProperty(key)) {
    //     return null;
    // }
    const copy = copyMap(arr);
    // no need to check since we already did that before.
    copy.delete(key);
    return copy;
}
