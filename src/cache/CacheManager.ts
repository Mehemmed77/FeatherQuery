import { VolatileCache } from './VolatileCache';
import { StorageCache } from './StorageCache';

export class CacheManager {
    volatileCache = new VolatileCache();
    sessionCache = new StorageCache(sessionStorage);
    permanentCache = new StorageCache(localStorage);
}
