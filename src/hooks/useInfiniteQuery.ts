import { useEffect, useReducer, useRef } from 'react';
import { InfiniteData, InfiniteQueryOptions } from '../types/infiniteQuery';
import useMemoizedKeys from '../utils/query/memoizeKeys';
import useQueryClient from '../utils/query/useQueryClient';
import InfiniteQueryReducer from '../core/InfiniteQueryReducer';
import { isDataStale } from '../utils/cache/cacheUtils';

export default function useInfiniteQuery<T = unknown, TPageParam = unknown>(
    key: TPageParam,
    fetcher: (pageParam: TPageParam, signal: AbortSignal) => Promise<T>,
    getNextPageParam: (lastPage: any, allPages: any) => any,
    options?: InfiniteQueryOptions
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

    const fetchPage = async (fresh: boolean) => {
        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            dispatch({ type: 'LOADING' });

            const cached = cache.get(key);
            if (!isDataStale(cached, staleTime)) {
                dispatch({
                    type: 'SUCCESS',
                    entity: { page: cached.data as T[], pageParam: key },
                });
                return;
            }

            const pagedData = await fetcher(key, abortControllerRef.current.signal);

        } catch (e: any) {
            if (e instanceof Error && e.name !== 'AbortError') {
                dispatch({ type: "ERROR", error: e });
            }
        } finally {
        }
    };

    useEffect(() => {
        fetchPage(true);

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        }

    }, [useMemoizedKeys(key)]);
}
