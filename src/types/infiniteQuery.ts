import { CacheMode } from "./cache";

export type InfiniteQueryOptions<T = unknown> = {
    getPreviousPageParam?: (firstPage: any, allPages: any) => any;
    staleTime?: number;
    onSuccess?: (data: T[][]) => any;
    onError?: (error: Error) => any;
    onSettled?: (data: T[][] | null, error: Error | null) => any;
    cacheMode?: CacheMode;
}

export type PagedDataEntry<T, TPageParam> = { page: T[], pageParam: TPageParam }
export type PagedDataEntries<T, TPageParam> = { pages: T[][], pageParams: TPageParam[] };