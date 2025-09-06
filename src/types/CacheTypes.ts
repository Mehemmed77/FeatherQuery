export type CacheEntry<T> = {
    data: T;
    updatedAt: number;
    cacheTime: number;
    error?: Error;
};
