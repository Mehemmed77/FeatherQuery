import { useEffect, useReducer, useRef } from 'react';
import { InfiniteQueryOptions, PagedDataEntries, PagedDataEntry } from '../types/infiniteQuery';
import useMemoizedKeys from '../utils/query/memoizeKeys';
import useQueryClient from '../utils/query/useQueryClient';
import InfiniteQueryReducer from '../core/InfiniteQueryReducer';
import { isDataStale } from '../utils/cache/cacheUtils';
import { fetchFresh } from '../utils/query/fetchFresh';
import useRequestIdTracker from '../utils/query/useLastRequestId';
import addEntity from '../utils/query/addEntity';

export default function useInfiniteQuery<T = unknown, TPageParam = unknown>(
    key: TPageParam,
    fetcher: (pageParam: TPageParam, signal: AbortSignal) => Promise<T[]>,
    getNextPageParam: (lastPage: TPageParam, allPages: PagedDataEntries<T, TPageParam>) => any,
    options?: InfiniteQueryOptions<T, TPageParam>
) {
    const {
        getPreviousPageParam,
        staleTime = 30_000,
        onSuccess,
        onError,
        onSettled,
        cacheMode = 'volatile',
    } = options ?? {};

    const { cache } = useQueryClient(cacheMode);

    // States
    const [state, dispatch] = useReducer(InfiniteQueryReducer<T, TPageParam>, {
        data: { pages: [], pageParams: [] },
        error: null,
        status: 'IDLE',
    });

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasFetchedOnce = useRef<boolean>(false);
    const { lastRequestIdRef, incrementAndGet } = useRequestIdTracker();

    const fetchPage = async (key: TPageParam) => {
        let tempData: PagedDataEntry<T, TPageParam> | null,
            tempError: Error | null;

        hasFetchedOnce.current = true;

        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            dispatch({ type: 'LOADING' });

            const currentRequestId = incrementAndGet();

            const cached = cache.get(key);
            let entity: PagedDataEntry<T, TPageParam>;

            if (cached) {
                entity = { page: cached.data as T[], pageParam: key }
                if(isDataStale(cached, staleTime)) {
                    dispatch({ type: "REFETCH_START", staleEntity: entity });
                    entity = await addEntity(
                        key,
                        fetcher,
                        abortControllerRef.current.signal,
                        currentRequestId,
                        lastRequestIdRef.current,
                        cache,
                    )

                    dispatch({ type: "REFETCH_END", entity: entity });
                }
            }

            else {
                entity = await addEntity(
                    key,
                    fetcher,
                    abortControllerRef.current.signal,
                    currentRequestId,
                    lastRequestIdRef.current,
                    cache,
                )
                dispatch({ type: "SUCCESS", entity: entity });
            }
            tempData = entity;

            onSuccess?.(tempData);

        } catch (e: any) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({ type: 'ERROR', error: e });
                tempError = e;
                onError?.(e);
            }
        } finally {
            onSettled?.(tempData, tempError);
        }
    };

    const fetchNextPage = () => {
        const newKey = getNextPageParam(key, data);
        fetchPage(newKey);
    }

    const fetchPreviousPage = () => {

    }

    useEffect(() => {
        if (hasFetchedOnce.current) dispatch({ type: "RESET" });
        fetchPage(key);

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [useMemoizedKeys(key)]);


    const { data, error, status } = state;

    return {data, error, status, fetchNextPage};
}
