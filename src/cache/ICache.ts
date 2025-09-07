import { CacheEntry } from '../types/cache';
import { areArraysEqualEvery, hashKey, isPrefix } from '../utils/general/arrays';

export class ICache {
    cache: Map<string, CacheEntry<unknown>> = new Map();

    get<T>(key: unknown): CacheEntry<T> | undefined {
        return this.cache.get(hashKey(key)) as CacheEntry<T> | undefined;
    }

    getAll<T>(): [string, CacheEntry<T>][] {
        return Array.from(this.cache.entries()) as [string, CacheEntry<T>][];
    }

    set<T>(key: unknown, entry: CacheEntry<T>): void {
        this.cache.set(hashKey(key), entry);
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
