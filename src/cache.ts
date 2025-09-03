import { CacheEntry } from './types/CacheTypes';
import areArraysEqualEvery from './utils/areArraysEqual';
import hashKey from './utils/hashKey';
import isPrefix from './utils/isPrefix';

const globalCache: Map<string, CacheEntry<unknown>> = new Map();

export class Cache {
    get<T>(key: unknown): CacheEntry<T> | undefined {
        return globalCache.get(hashKey(key)) as CacheEntry<T> | undefined;
    }

    getAll<T>(): [string, CacheEntry<T>][] {
        return Array.from(globalCache.entries()) as [string, CacheEntry<T>][];
    }

    set<T>(key: unknown, entry: CacheEntry<T>): void {
        globalCache.set(hashKey(key), entry);
    }

    delete(prefix: unknown[], exact = false) {
        for (const key of globalCache.keys()) {
            const full = JSON.parse(key) as unknown[];
            if (exact && areArraysEqualEvery(prefix, full)) {
                globalCache.delete(key);
                break;
            }

            if (!exact && isPrefix(prefix, full)) globalCache.delete(key);
        }
    }

    deleteAll() {
        globalCache.clear();
    }
}

export default function startCacheGC(
    interval: number,
    defaultCacheTime: number
) {
    return setInterval(() => {
        for (const [key, value] of globalCache.entries()) {
            if (Date.now() - value.updatedAt > defaultCacheTime)
                globalCache.delete(key);
        }
    }, interval);
}
