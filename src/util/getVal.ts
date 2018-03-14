

export function getVal<T, K extends keyof T>(arr: T, key: K): T[K] {
    return arr[key];
}
