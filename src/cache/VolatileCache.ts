import { MAX_CACHE_SIZE } from '../constants/constant';
import { LRUNode } from '../types/cache';
import { ICache } from './ICache';

export class VolatileCache extends ICache {
    startCacheGC(interval: number, defaultCacheTime: number) {
        return setInterval(() => {
            if (this.cache.size <= MAX_CACHE_SIZE) return;
            console.log("Starting");
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
