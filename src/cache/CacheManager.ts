import { VolatileCache } from './VolatileCache';
import { StorageCache } from './StorageCache';

export class CacheManager {
    static volatileCache = new VolatileCache();
    static sessionCache = new StorageCache(sessionStorage);
    static permanentCache = new StorageCache(localStorage);
}
