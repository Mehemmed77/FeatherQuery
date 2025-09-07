import { CacheMode } from "./cache";

export type QueryOptions<T> = {
    pollInterval?: number;
    staleTime?: number;
    onSuccess?: (data: T) => any;
    onError?: (error: Error) => any;
    onSettled?: (data: T | null, error: Error | null) => any;
    cacheMode?: CacheMode;
};
