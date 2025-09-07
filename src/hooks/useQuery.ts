import { useCallback, useEffect, useReducer, useRef } from 'react';
import usePolling from '../utils/query/usePolling';
import { isDataStale, updateCache } from '../utils/cache/cacheUtils';
import useRequestIdTracker from '../utils/query/useLastRequestId';
import memoizeKeys from '../utils/query/memoizeKeys';
import { queryReducer } from '../core/QueryReducer';
import useQueryClient from '../utils/query/useQueryClient';
import { fetchFresh } from '../utils/query/fetchFresh';
import { QueryOptions } from '../types/query';

export default function useQuery<T = unknown>(
    key: any[],
    fetcher: (signal: AbortSignal) => Promise<T>,
    options?: QueryOptions<T>
) {
    // States
    const [state, dispatch] = useReducer(queryReducer<T>, {
        response: null,
        data: null,
        error: null,
        status: 'STATIC',
    });

    const { lastRequestIdRef, incrementAndGet } = useRequestIdTracker();

    // Refs
    const hasFetchedOnce = useRef<number>(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestInFlight = useRef<boolean>(false);

    const {
        pollInterval,
        staleTime = 30_000,
        onSuccess,
        onError,
        onSettled,
        cacheMode,
    } = options ?? {};

    const { cache } = useQueryClient(cacheMode);

    const fetchData = async (isPolling?: boolean) => {
        if (hasFetchedOnce.current === 0 && !cache.get<T>(key))
            dispatch({ type: 'LOADING' });

        let tempError: Error | null;

        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            const currentRequestId = incrementAndGet();

            if (hasFetchedOnce.current !== 0) dispatch({ type: 'FETCHING' });

            requestInFlight.current = true;

            const cachedData = cache.get<T>(key);

            if (cachedData) {
                if (isPolling || isDataStale(cachedData, staleTime)) {
                    dispatch({
                        type: 'REFETCH_START',
                        cachedData: cachedData.data,
                    });

                    await fetchFresh(
                        fetcher,
                        abortControllerRef.current,
                        key,
                        staleTime,
                        currentRequestId,
                        lastRequestIdRef.current,
                        cache,
                        dispatch,
                        onSuccess
                    );
                } else {
                    dispatch({ type: 'SUCCESS', data: cachedData.data });
                }
            } else {
                const newData = await fetcher(
                    abortControllerRef.current.signal
                );

                if (currentRequestId !== lastRequestIdRef.current) return;

                dispatch({ type: 'SUCCESS', data: newData });
                onSuccess?.(newData);

                updateCache(key, newData, staleTime, cache);
            }

            hasFetchedOnce.current = 1;
            requestInFlight.current = false;
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                dispatch({ type: 'ERROR', error: err });
                onError?.(err);
                tempError = err;
                requestInFlight.current = false;
            }
        } finally {
            onSettled?.(cache.get<T>(key)?.data ?? null, tempError ?? null);
        }
    };

    usePolling(fetchData, pollInterval ?? 0, requestInFlight);

    useEffect(() => {
        fetchData();

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            hasFetchedOnce.current = 0;
        };
    }, [memoizeKeys(key), fetcher]);

    const refetch = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        return fetchData();
    }, [key, fetcher]);

    return {
        data: state.data,
        error: state.error,
        status: state.status,
        refetch,
    };
}
