import { Cache } from '../cache/VolatileCache';
import { CacheEntry } from '../types/CacheTypes';

export function updateCache<T>(
    key: string[],
    data: T,
    staleTime: number,
    cache: Cache
) {
    const now = Date.now();
    cache.set<T>(key, {
        data,
        updatedAt: now,
        cacheTime: staleTime ? staleTime + now : Infinity,
    });
}

export function isDataStale<T>(
    cached: CacheEntry<T> | undefined,
    staleTime: number
) {
    const now = Date.now();
    console.log(cached, now > cached.updatedAt + staleTime);
    return cached ? now > cached.updatedAt + staleTime : true;
}
