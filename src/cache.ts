type CacheEntry<T> = {
    data: T;
    updatedAt: number;
    error?: Error;
};

const globalCache: Record<string, CacheEntry<unknown>> = {};

export function getCachedValue<T>(key: string): CacheEntry<T> | undefined {
    return globalCache[key] as CacheEntry<T> | undefined;
};

export function setCachedValue<T>(key: string, entry: CacheEntry<T>): void {
    globalCache[key] = entry;
}

export function deleteCachedValue(key?: string) {
    if(key) delete globalCache[key];
    else Object.keys(globalCache).forEach(k => delete globalCache[k]);
}
