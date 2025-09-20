export const MAX_CACHE_SIZE = 100;
export const DEFAULT_GC_INTERVAL = 60_000;
export const DEFAULT_QUERY_STALE_TIME = 30_000;
export const defaultRetryDelayFunction = (attempt: number) => 1000 * 2 ** (attempt - 1)