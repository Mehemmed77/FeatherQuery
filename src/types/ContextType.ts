import { deleteCachedValueType, getCachedValueType, setCachedValueType } from "./CacheTypes"

export interface ContextType {
    getCachedValue: getCachedValueType;
    setCachedValue: setCachedValueType
    deleteCachedValue: deleteCachedValueType
}