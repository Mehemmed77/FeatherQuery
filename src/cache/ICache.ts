import { CacheEntry, LRUNode } from '../types/cache';
import {
    areArraysEqualEvery,
    hashKey,
    isPrefix,
} from '../utils/general/arrays';

export class ICache {
    cache: Map<string, CacheEntry<unknown>> = new Map();

    get<T>(key: unknown): CacheEntry<T> | undefined {
        const entry = this.cache.get(hashKey(key));
        if (entry) {
            entry.lastAccessed = Date.now();
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
}
