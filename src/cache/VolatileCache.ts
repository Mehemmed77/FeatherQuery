import { CacheEntry } from '../types/cache';
import { ICache } from './ICache';

export class VolatileCache extends ICache {
    cache: Map<string, CacheEntry<unknown>> = new Map();

    startCacheGC(interval: number, defaultCacheTime: number) {
        return setInterval(() => {
            for (const [key, value] of this.cache.entries()) {
                if (Date.now() - value.updatedAt > defaultCacheTime) {
                    this.cache.delete(key);
                }
            }
        }, interval);
    }
}
