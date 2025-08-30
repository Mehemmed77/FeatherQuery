import { CacheEntry } from "./types/CacheTypes";
import hashKey from "./utils/hashKey";

const globalCache: Map<string, CacheEntry<unknown>> = new Map();

export function getCachedValue<T>(key: unknown): CacheEntry<T> | undefined {
    return globalCache.get(hashKey(key)) as CacheEntry<T> | undefined;
};

export function setCachedValue<T>(key: unknown, entry: CacheEntry<T>): void {
    globalCache.set(hashKey(key),entry);
}

export function deleteCachedValue(key?: unknown) {
    if(key) globalCache.delete(hashKey(key));
    else {
        globalCache.clear();
    }
}

export default function startCacheGC(interval: number, defaultCacheTime: number) {
    return setInterval(() => {
        for (const [key, value] of globalCache.entries()) {
            if (Date.now() - value.updatedAt > defaultCacheTime) globalCache.delete(key);
        }
    }, interval);
}
