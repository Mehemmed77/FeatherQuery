import { useCallback, useEffect, useReducer, useRef } from 'react';
import usePolling from '../utils/query/usePolling';
import { isDataStale, updateCache } from '../utils/cache/cacheUtils';
import useRequestIdTracker from '../utils/query/useLastRequestId';
import { queryReducer } from '../core/QueryReducer';
import useQueryClient from '../utils/query/useQueryClient';
import { fetchFresh } from '../utils/query/fetchFresh';
import { QueryOptions } from '../types/query';
import useMemoizedKeys from '../utils/query/memoizeKeys';
import { DEFAULT_QUERY_STALE_TIME } from '../constants/constant';

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

    // Refs
    const hasFetchedOnce = useRef<number>(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestInFlight = useRef<boolean>(false);

    const {
        pollInterval = 0,
        staleTime = DEFAULT_QUERY_STALE_TIME,
        onSuccess,
        onError,
        onSettled,
        cacheMode = 'volatile',
    } = options ?? {};

    const { cache } = useQueryClient(cacheMode);

    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onSettledRef = useRef(onSettled);
    const fetcherRef = useRef(fetcher);

    const fetchData = useCallback(
        async (force?: boolean) => {
            if (hasFetchedOnce.current === 0 && !cache.get<T>(key))
                dispatch({ type: 'LOADING' });

            let tempError: Error | null;

            try {
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                abortControllerRef.current = new AbortController();

                if (hasFetchedOnce.current !== 0)
                    dispatch({ type: 'FETCHING' });

                requestInFlight.current = true;

                const cachedData = cache.get<T>(key);

                if (cachedData) {
                    if (force || isDataStale(cachedData, staleTime)) {
                        dispatch({
                            type: 'REFETCH_START',
                            cachedData: cachedData.data as T,
                        });

                        await fetchFresh(
                            fetcherRef.current,
                            abortControllerRef.current,
                            key,
                            cache,
                            dispatch,
                            onSuccessRef.current
                        );
                    } else {
                        dispatch({
                            type: 'SUCCESS',
                            data: cachedData.data as T,
                        });
                    }
                } else {
                    const newData = await fetcherRef.current(
                        abortControllerRef.current.signal
                    );

                    dispatch({ type: 'SUCCESS', data: newData });
                    onSuccessRef.current?.(newData);

                    updateCache(key, newData, cache);
                }

                hasFetchedOnce.current = 1;
                requestInFlight.current = false;
            } catch (err) {
                let normalizedError: Error;

                if (err instanceof Error) normalizedError = err;
                else normalizedError = new Error(String(err));

                if (normalizedError.name === 'AbortError') return;

                dispatch({ type: 'ERROR', error: err });
                onErrorRef.current?.(err);
                tempError = err;
                requestInFlight.current = false;
            } finally {
                onSettledRef.current?.(
                    (cache.get<T>(key)?.data as T) ?? null,
                    tempError ?? null
                );
            }
        },
        [useMemoizedKeys(key), staleTime]
    );

    usePolling(fetchData, pollInterval ?? 0, requestInFlight);

    useEffect(() => {
        fetchData();

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            hasFetchedOnce.current = 0;
        };
    }, [useMemoizedKeys(key)]);

    const refetch = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        return fetchData(true);
    }, [useMemoizedKeys(key)]);

    return {
        data: state.data,
        error: state.error,
        status: state.status,
        refetch,
    };
}
