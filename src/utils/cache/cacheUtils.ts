import { StorageCache } from '../../cache/StorageCache';
import { VolatileCache } from '../../cache/VolatileCache';
import { CacheEntry } from '../../types/cache';

export function updateCache<T>(
    key: string[],
    data: T,
    cache: VolatileCache | StorageCache
) {
    const now = Date.now();
    cache.set<T>(key, {
        data,
        updatedAt: now,
        lastAccessed: now
    });
}

export function isDataStale<T>(
    cached: CacheEntry<T> | undefined,
    staleTime: number
) {
    const now = Date.now();
    return cached ? now > cached.updatedAt + staleTime : true;
}
