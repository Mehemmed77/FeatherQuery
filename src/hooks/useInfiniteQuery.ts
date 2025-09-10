import { useEffect, useReducer, useRef } from 'react';
import { InfiniteQueryOptions, PagedDataEntry } from '../types/infiniteQuery';
import useMemoizedKeys from '../utils/query/memoizeKeys';
import useQueryClient from '../utils/query/useQueryClient';
import InfiniteQueryReducer from '../core/InfiniteQueryReducer';
import { isDataStale } from '../utils/cache/cacheUtils';
import { fetchFresh } from '../utils/query/fetchFresh';
import useRequestIdTracker from '../utils/query/useLastRequestId';

export default function useInfiniteQuery<T = unknown, TPageParam = unknown>(
    key: TPageParam,
    fetcher: (pageParam: TPageParam, signal: AbortSignal) => Promise<T[]>,
    getNextPageParam: (lastPage: any, allPages: any) => any,
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
        data: null,
        error: null,
        pageParam: key,
        status: 'IDLE',
    });

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasFetchedOnce = useRef<boolean>(false);
    const { lastRequestIdRef, incrementAndGet } = useRequestIdTracker();

    const fetchPage = async (key: TPageParam, fresh: boolean) => {
        let tempData: PagedDataEntry<T, TPageParam> | null,
            tempError: Error | null;

        hasFetchedOnce.current = true;

        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            dispatch({ type: 'LOADING' });

            const currentRequestId = incrementAndGet();

            const cached = cache.get(key);
            if (cached) {
                const entity = { page: cached.data as T[], pageParam: key };
                if(isDataStale(cached, staleTime)) {
                    dispatch({ type: "REFETCH_START", staleEntity: entity });
                    await fetchFresh(
                        fetcher,
                        abortControllerRef,
                        key,
                        currentRequestId,
                        lastRequestIdRef.current,
                        cache,
                        dispatch,
                        "infiniteQuery",
                        onSuccess
                    );
                }
            }

            const pagedData = await fetcher(
                key,
                abortControllerRef.current.signal
            );
            const entity = { page: pagedData, pageParam: key };

            if (currentRequestId !== lastRequestIdRef.current) return;

            dispatch({
                type: 'SUCCESS',
                entity: entity,
            });

            tempData = entity;

            onSuccess?.({ page: pagedData, pageParam: key });

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

    useEffect(() => {
        if (hasFetchedOnce.current) dispatch({ type: "RESET" });
        fetchPage(key, true);

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [useMemoizedKeys(key)]);
}
