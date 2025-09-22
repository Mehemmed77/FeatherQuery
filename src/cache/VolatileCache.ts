import { MAX_CACHE_SIZE } from '../constants/constant';
import { CacheEntry, LRUNode } from '../types/cache';
import { hashKey } from '../utils/general/arrays';
import { ICache } from './ICache';

export class VolatileCache extends ICache {
    head: LRUNode = null;
    tail: LRUNode = null;

    get<T>(key: unknown): CacheEntry<T> | undefined {
        const entry = this.cache.get(hashKey(key));
        if (entry) {
            entry.lastAccessed = Date.now();
            this.movePointerToHead(entry.node);
        }
        return entry as CacheEntry<T> | undefined;
    }

    set<T>(key: unknown, entry: CacheEntry<T>): void {
        const hashedKey = hashKey(key);

        let existingEntry = this.cache.get(hashedKey);

        if (existingEntry) {
            existingEntry.data = entry.data;
            existingEntry.updatedAt = entry.updatedAt;
            existingEntry.lastAccessed = entry.lastAccessed;
            this.movePointerToHead(existingEntry.node);
            return;
        }

        const newNode: LRUNode = {
            key: hashedKey,
            prev: null,
            next: null,
        };

        this.movePointerToHead(newNode);
        entry.node = newNode;

        this.cache.set(hashedKey, entry);
    }

    
    movePointerToHead(node: LRUNode) {
        if (this.head === node) return;
        
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        if (node === this.tail) this.tail = node.prev;
        
        node.prev = null;
        node.next = this.head;
        if (this.head) this.head.prev = node;
        this.head = node;
        
        if (!this.tail) this.tail = node;
    }

    startCacheGC(interval: number) {
        return setInterval(() => {
            console.log(this.head, this.tail);
            if (this.cache.size <= MAX_CACHE_SIZE) return;
            let count = 0,
                k = this.cache.size - MAX_CACHE_SIZE;

            let tail: LRUNode = this.tail;
            while (count < k) {
                const key = tail.key;
                const entry = this.cache.get(key);

                entry.updatedAt = 0; // which means it is stale.
                tail = tail.prev;
                count++;
            }
        }, interval);
    }
}
