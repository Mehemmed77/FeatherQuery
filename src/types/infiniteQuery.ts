import { CacheMode } from "./cache";

export type PagedDataEntry<T, TPageParam> = { page: T[], pageParam: TPageParam }
export type PagedDataEntries<T, TPageParam> = { pages: T[][], pageParams: TPageParam[] };

export type InfiniteQueryOptions<T, TPageParam> = {
    getPreviousPageParam?: (firstPage: any, allPages: any) => any;
    staleTime?: number;
    onSuccess?: (entity: PagedDataEntry<T, TPageParam>) => any;
    onError?: (error: Error) => any;
    onSettled?: (entity: PagedDataEntry<T, TPageParam> | null, error: Error | null) => any;
    cacheMode?: CacheMode;
}
