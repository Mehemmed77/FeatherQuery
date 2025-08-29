import { deleteCachedValue, getCachedValue, setCachedValue } from "../cache";

export type CacheEntry<T> = {
    data: T;
    updatedAt: number;
    cacheTime: number;
    error?: Error;
};

export type getCachedValueType = typeof getCachedValue;
export type setCachedValueType = typeof setCachedValue;
export type deleteCachedValueType = typeof deleteCachedValue;