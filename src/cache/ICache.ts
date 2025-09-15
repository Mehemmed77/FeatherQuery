import { CacheEntry, LRUNode } from '../types/cache';
import {
    areArraysEqualEvery,
    hashKey,
    isPrefix,
} from '../utils/general/arrays';

export class ICache {
    cache: Map<string, CacheEntry<unknown>> = new Map();
    head: LRUNode = null;
    tail: LRUNode = null;

    get<T>(key: unknown): CacheEntry<T> | undefined {
        const entry = this.cache.get(hashKey(key));
        if (entry) {
            entry.lastAccessed = Date.now();
            this.movePointerToHead(entry.node);
        };
        return entry as CacheEntry<T> | undefined;
    }

    getAll<T>(): [string, CacheEntry<T>][] {
        const entries = Array.from(this.cache.entries()) as [
            string,
            CacheEntry<T>
        ][];
        entries.forEach(([_, entry]) => (entry.lastAccessed = Date.now()));
        return entries;
    }

    set<T>(key: unknown, entry: CacheEntry<T>): void {
        const hashedKey = hashKey(key);
        const newNode: LRUNode = {
            key: hashedKey,
            prev: null,
            next: null
        };
        
        this.movePointerToHead(newNode);
        entry.node = newNode;

        this.cache.set(hashedKey, entry);
    }

    delete(prefix: unknown[], exact = false) {
        for (const key of this.cache.keys()) {
            const full = JSON.parse(key) as unknown[];
            if (exact && areArraysEqualEvery(prefix, full)) {
                this.cache.delete(key);
                break;
            }

            if (!exact && isPrefix(prefix, full)) this.cache.delete(key);
        }
    }

    deleteAll() {
        this.cache.clear();
    }

    movePointerToHead(node: LRUNode) {
        if(this.head === node) return;

        if(node.prev) node.prev.next = node.next;
        if(node.next) node.next.prev = node.prev;
        if(node === this.tail) this.tail = node.prev;

        node.prev = null;
        node.next = this.head;
        if (this.head) this.head.prev = node;
        this.head = node;

        if(!this.tail) this.tail = node;
    }
}
