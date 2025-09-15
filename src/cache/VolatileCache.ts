import { LRUNode } from '../types/cache';
import { ICache } from './ICache';

export class VolatileCache extends ICache {
    startCacheGC(interval: number, defaultCacheTime: number) {
        return setInterval(() => {
            if (this.cache.size <= 100) return;
            let count = 0,
                k = this.cache.size - 100;

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
