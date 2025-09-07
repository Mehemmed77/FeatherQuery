import { StorageCache } from '../cache/StorageCache';
import { VolatileCache } from '../cache/VolatileCache';

export interface ContextType {
    volatileCache: VolatileCache;
    sessionCache: StorageCache;
    permanentCache: StorageCache;
}
