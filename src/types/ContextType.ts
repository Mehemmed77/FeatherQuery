import { Cache, PermanentCache } from "../cache"

export interface ContextType {
    cache: Cache,
    permanentCache: PermanentCache
}