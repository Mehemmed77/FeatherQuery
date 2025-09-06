import { CacheMode } from '../types/CacheModeType';
import { VolatileCache } from './VolatileCache';
import { StorageCache } from './StorageCache';

export class CacheManager {
    volatileCache = new VolatileCache();
    sessionCache = new StorageCache(sessionStorage);
    permanentCache = new StorageCache(localStorage);

    getCache(mode: CacheMode | null | undefined) {
        if (!mode || mode === 'volatile') return this.volatileCache;
        if (mode === 'session') return this.sessionCache;
        return this.permanentCache;
    }
}
