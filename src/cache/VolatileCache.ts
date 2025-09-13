import { ICache } from './ICache';

export class VolatileCache extends ICache {
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
