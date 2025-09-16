import { StorageCache } from "../../cache/StorageCache";
import { VolatileCache } from "../../cache/VolatileCache";
import { QueryAction } from "../../core/InfiniteQueryReducer";
import { CacheEntry } from "../../types/cache";

export default async function addEntity<T, TPageParam>(
    key: TPageParam,
    fetcher: (pageParam: TPageParam, signal: AbortSignal) => Promise<T[]>,
    signal: AbortSignal,
    currentRequestId: number,
    lastRequestId: number,
    cache: VolatileCache | StorageCache,
) {
    const pagedData = await fetcher(key, signal);
    const entity = { page: pagedData, pageParam: key };

    if (currentRequestId !== lastRequestId) return;

    const cacheEntity: CacheEntry<T> = { data: pagedData as T[], updatedAt: Date.now(), lastAccessed: Date.now(), node: null};
    cache.set<T>(key, cacheEntity);

    return entity;
}