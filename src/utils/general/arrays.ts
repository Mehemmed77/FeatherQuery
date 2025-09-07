export function areArraysEqualEvery(arr1: unknown[], arr2: unknown[]) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    return arr1.every((value, index) => value === arr2[index]);
}

export function hashKey(key: unknown): string {
    return Array.isArray(key) ? JSON.stringify(key) : String(key);  
}

export function isPrefix(prefix: unknown[], full: unknown[]) {
    return prefix.every((value, index) => full[index] === value);
}