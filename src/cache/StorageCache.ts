import { CacheEntry } from '../types/cache';
import {
    areArraysEqualEvery,
    hashKey,
    isPrefix,
} from '../utils/general/arrays';

export class StorageCache {
    storage: Storage;

    private storageMap: Map<string, CacheEntry<unknown>> = new Map();

    constructor(storage: Storage) {
        this.storage = storage;
    }

    get<T>(key: unknown): CacheEntry<T> | undefined {
        return JSON.parse(this.storage.getItem(hashKey(key))) as
            | CacheEntry<T>
            | undefined;
    }

    getAll<T>(): [string, CacheEntry<T>][] {
        return Array.from(this.storage.entries()) as [string, CacheEntry<T>][];
    }

    set<T>(key: unknown, entry: CacheEntry<T>): void {
        this.storage.setItem(hashKey(key), JSON.stringify(entry));
    }

    delete(prefix: unknown[], exact = false) {
        for (const key of this.storage.keys()) {
            const full = JSON.parse(key) as unknown[];
            if (exact && areArraysEqualEvery(prefix, full)) {
                this.storage.delete(key);
                break;
            }

            if (!exact && isPrefix(prefix, full)) this.storage.delete(key);
        }
    }

    deleteAll() {
        this.storage.clear();
    }
}
