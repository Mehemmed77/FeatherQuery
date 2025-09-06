import { StorageCache } from '../cache/StorageCache';
import { VolatileCache } from '../cache/VolatileCache';

export interface ContextType {
    cache: VolatileCache | StorageCache;
}
