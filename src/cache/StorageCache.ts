import { CacheEntry } from '../types/cache';
import { ICache } from './ICache';

export class StorageCache extends ICache {
    storage: Storage;

    cache: Map<string, CacheEntry<unknown>>;
    storageKey = 'featherQuery'

    hydrateCache() {
        const raw = this.storage.getItem(this.storageKey);

        if(!raw) {
            this.cache = new Map();
            return;
        }
        

        try {
            const parsed = JSON.parse(raw) as [string, CacheEntry<unknown>][];
            this.cache = new Map(parsed);
        } catch {
            this.cache = new Map();
        }

    }

    constructor(storage: Storage) {
        super();
        this.storage = storage;
        this.hydrateCache();
    }

    writeToStorage() {
        const entries = Array.from(this.cache.entries());
        this.storage.setItem(this.storageKey, JSON.stringify(entries))
    }

    set<T>(key: unknown, entry: CacheEntry<T>): void {
        super.set(key, entry);
        this.writeToStorage();
    }
}
