export type CacheEntry<T> = {
    data: T;
    updatedAt: number;
    cacheTime: number;
    userSet?: boolean; 
    error?: Error;
};
