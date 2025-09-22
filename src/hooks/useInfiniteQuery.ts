import { useEffect, useReducer, useRef } from 'react';
import {
    InfiniteQueryOptions,
    PagedDataEntries,
    PagedDataEntry,
} from '../types/infiniteQuery';
import useMemoizedKeys from '../utils/query/memoizeKeys';
import useQueryClient from '../utils/query/useQueryClient';
import InfiniteQueryReducer from '../core/InfiniteQueryReducer';
import { isDataStale } from '../utils/cache/cacheUtils';
import useRequestIdTracker from '../utils/query/useLastRequestId';
import addEntity from '../utils/query/addEntity';
import { DEFAULT_QUERY_STALE_TIME } from '../constants/constant';

export default function useInfiniteQuery<T = unknown>(
    key: string | number,
    fetcher: (pageParam: string | number, signal: AbortSignal) => Promise<T[]>,
    getNextPageParam: (lastPageParam: string | number) => any,
    options?: InfiniteQueryOptions<T>,
) {
    const {
        getPreviousPageParam,
        initialFetch = false,
        staleTime = DEFAULT_QUERY_STALE_TIME,
        onSuccess,
        onError,
        onSettled,
        cacheMode = 'volatile',
    } = options ?? {};

    const { cache } = useQueryClient(cacheMode);

    // States
    const [state, dispatch] = useReducer(InfiniteQueryReducer<T>, {
        data: { pages: [], pageParams: [] },
        error: null,
        status: 'IDLE',
    });

    // Refs
    const abortControllerRef = useRef<AbortController | null>(null);
    const hasFetchedOnce = useRef<boolean>(false);
    const { lastRequestIdRef, incrementAndGet } = useRequestIdTracker();

    const fetchPage = async (key: string | number) => {
        let tempData: PagedDataEntry<T> | null, tempError: Error | null;

        hasFetchedOnce.current = true;

        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            dispatch({ type: 'LOADING' });

            const currentRequestId = incrementAndGet();

            const cached = cache.get(key);

            if (cached) {
                tempData = { page: cached.data as T[], pageParam: key };
                if (isDataStale(cached, staleTime)) {
                    dispatch({ type: 'REFETCH_START', staleEntity: tempData });
                    tempData = await addEntity(
                        key,
                        fetcher,
                        abortControllerRef.current.signal,
                        currentRequestId,
                        lastRequestIdRef.current,
                        cache
                    );

                    dispatch({ type: 'REFETCH_END', entity: tempData });
                }
            } else {
                tempData = await addEntity(
                    key,
                    fetcher,
                    abortControllerRef.current.signal,
                    currentRequestId,
                    lastRequestIdRef.current,
                    cache
                );
                dispatch({ type: 'SUCCESS', entity: tempData });
            }

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
        const length = state.data.pageParams.length;
        if (length === 0) {
            fetchPage(key);
            return;
        }

        const newKey = getNextPageParam(state.data.pageParams[length - 1]);
        fetchPage(newKey);
    };

    const fetchPreviousPage = () => {
        const length = state.data.pageParams.length;
        if (length !== 0) {
            const newKey = getPreviousPageParam(state.data.pageParams[0]);
            fetchPage(newKey);
        }
    };

    useEffect(() => {
        if (hasFetchedOnce.current) dispatch({ type: 'RESET' });
        if (initialFetch) fetchPage(key);

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [useMemoizedKeys(key)]);

    const { data, error, status } = state;

    return { data, error, status, fetchNextPage, fetchPreviousPage };
}
