export type CacheEntry<T> = {
    data: T;
    updatedAt: number;
    cacheTime: number;
    permanent?: boolean; 
    error?: Error;
};
