import { CacheMode } from "./cache";

export type PagedDataEntry<T> = { page: T[], pageParam: string | number }
export type PagedDataEntries<T> = { pages: T[][], pageParams: (string | number)[] };

export type InfiniteQueryOptions<T> = {
    getPreviousPageParam?: (firstPageParam: string | number) => any;
    staleTime?: number;
    onSuccess?: (entity: PagedDataEntry<T>) => any;
    onError?: (error: Error) => any;
    onSettled?: (entity: PagedDataEntry<T> | null, error: Error | null) => any;
    initialFetch?: boolean;
    cacheMode?: CacheMode;
}
