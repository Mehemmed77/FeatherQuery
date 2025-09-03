import { useCallback, useEffect, useReducer, useRef } from 'react';
import usePolling from '../utils/usePolling';
import { queryReducer } from '../reducers/queryReducer';
import { isDataStale, updateCache } from '../utils/cacheUtils';
import { fetchFresh } from '../utils/fetchFresh';
import useRequestIdTracker from '../utils/useLastRequestId';
import useQueryClient from '../utils/useQueryClient';
import memoizeKeys from '../utils/memoizeKeys';

export default function useQuery<T = unknown>(
    key: any[],
    fetcher: (signal: AbortSignal) => Promise<T>,
    options?: {
        pollInterval?: number;
        staleTime?: number;
        onSuccess?: (data: T) => any;
        onError?: (error: Error) => any;
        onSettled?: (data: T | null, error: Error | null) => any;
    }
) {
    // States
    const [state, dispatch] = useReducer(queryReducer<T>, {
        data: null,
        error: null,
        status: 'STATIC',
    });

    const { cache } = useQueryClient();
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
    } = options ?? {};
    
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
                dispatch({ type: "REFETCH_START", cachedData: cachedData.data });
                console.log(isPolling);
                if (isPolling || isDataStale(cachedData, staleTime)) {
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
                }
            } else {
                const newData = await fetcher(abortControllerRef.current.signal);

                if (currentRequestId !== lastRequestIdRef.current) return;

                dispatch({ type: 'SUCCESS', data: newData });
                onSuccess?.(newData);

                updateCache(key, newData, staleTime, cache);
                console.log("SALAM");
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
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        return fetchData();
    }, [key, fetcher]);


    return { data: state.data, error: state.error, status: state.status, refetch };
}
