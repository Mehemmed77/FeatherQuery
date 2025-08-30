import { CacheEntry, setCachedValueType } from '../types/CacheTypes';

export function updateCache<T>(
    key: string[],
    data: T,
    staleTime: number,
    setCachedValue: setCachedValueType
) {
    const now = Date.now();
    setCachedValue<T>(key, {
        data,
        updatedAt: now,
        cacheTime: staleTime ? staleTime + now : Infinity,
    });
}

export function isDataStale<T>(cached: CacheEntry<T> | undefined, staleTime: number) {
    return cached ? Date.now() + cached.updatedAt > staleTime : true;
}
