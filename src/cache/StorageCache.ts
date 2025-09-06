import { CacheEntry } from "../types/CacheTypes";
import areArraysEqualEvery from "../utils/areArraysEqual";
import hashKey from "../utils/hashKey";
import isPrefix from "../utils/isPrefix";

export class StorageCache {
    storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
    }

    get<T>(key: unknown): CacheEntry<T> | undefined {
        return this.storage.get(hashKey(key)) as CacheEntry<T> | undefined;
    }

    getAll<T>(): [string, CacheEntry<T>][] {
        return Array.from(this.storage.entries()) as [string, CacheEntry<T>][];
    }

    set<T>(key: unknown, entry: CacheEntry<T>): void {
        this.storage.set(hashKey(key), entry);
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
