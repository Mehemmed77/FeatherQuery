export type CacheEntry<T> = {
    data: T;
    updatedAt: number;
};

export type CacheMode = "permanent" | "session" | "volatile";