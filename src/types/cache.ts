export type CacheEntry<T> = {
    data: T;
    updatedAt: number;
    lastAccessed: number;
};

export type CacheMode = "permanent" | "session" | "volatile";