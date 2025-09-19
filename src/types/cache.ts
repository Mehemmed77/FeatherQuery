export type CacheEntry<T> = {
    data: T | T[];
    updatedAt: number;
    node: LRUNode | null;
    lastAccessed: number;
};

export interface LRUNode {
    key: string;
    prev?: LRUNode;
    next?: LRUNode;
}

export type CacheMode = "permanent" | "session" | "volatile";