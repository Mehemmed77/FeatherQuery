import { CacheEntry } from "./types/CacheTypes";
import areArraysEqualEvery from "./utils/areArraysEqual";
import hashKey from "./utils/hashKey";
import isPrefix from "./utils/isPrefix";

const globalCache: Map<string, CacheEntry<unknown>> = new Map();

export function getCachedValue<T>(key: unknown): CacheEntry<T> | undefined {
    return globalCache.get(hashKey(key)) as CacheEntry<T> | undefined;
};

export function setCachedValue<T>(key: unknown, entry: CacheEntry<T>): void {
    globalCache.set(hashKey(key),entry);
}

export function deleteCachedValue(prefix?: unknown[], exact = false) {
    if(prefix) {
        for(const key of globalCache.keys()) {
            const full = JSON.parse(key) as unknown[];
            if (exact && areArraysEqualEvery(prefix, full)) {
                globalCache.delete(key);
                break;
            }

            if (!exact && isPrefix(prefix, full)) globalCache.delete(key);
        }
    }
    else globalCache.clear();
}

export function getAll<T>(): [string, CacheEntry<T>][] {
    return Array.from(globalCache.entries()) as [string, CacheEntry<T>][];
}

export default function startCacheGC(interval: number, defaultCacheTime: number) {
    return setInterval(() => {
        for (const [key, value] of globalCache.entries()) {
            if (Date.now() - value.updatedAt > defaultCacheTime) globalCache.delete(key);
        }
    }, interval);
}
