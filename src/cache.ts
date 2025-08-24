type CacheEntry<T> = {
    data: T;
    updatedAt: number;
    cacheTime: number;
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

function startCacheGC(interval = 60000) {
    return setInterval(() => {
        Object.entries(globalCache).forEach(([key, value]) => {
            if(Date.now() - value.updatedAt > 300000) {
                delete globalCache[key];
            }
        });
    }, interval);
}
