import { useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import QueryContext from '../context/QueryContext';
import usePolling from '../utils/usePolling';
import { queryReducer } from '../reducers/queryReducer';
import { isDataStale, updateCache } from '../utils/cacheUtils';
import { fetchFresh } from '../utils/fetchFresh';
import useRequestIdTracker from '../utils/useLastRequestId';
import useQueryClient from '../utils/useQueryClient';

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

    const { data, error, status } = state;
    const { setCachedValue, getCachedValue } = useQueryClient();
    const { lastRequestId, incrementAndGet } = useRequestIdTracker();

    // Refs
    const hasFetchedOnce = useRef<number>(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const requestInFlight = useRef<boolean>(false);

    const {
        pollInterval,
        staleTime = 0,
        onSuccess,
        onError,
        onSettled,
    } = options ?? {};

    const fetchData = async (isPolling?: boolean) => {
        if (hasFetchedOnce.current === 0 && !getCachedValue<T>(key))
            dispatch({ type: 'LOADING' });

        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            const currentRequestId = incrementAndGet();

            if (hasFetchedOnce.current !== 0) dispatch({ type: 'FETCHING' });

            requestInFlight.current = true;

            const cachedData = getCachedValue<T>(key);

            if (cachedData) {
                dispatch({ type: 'SUCCESS', data: cachedData.data });
                if (isPolling || isDataStale(cachedData, staleTime)) {
                    await fetchFresh(
                        fetcher,
                        abortControllerRef.current,
                        key,
                        staleTime,
                        currentRequestId,
                        lastRequestId,
                        setCachedValue,
                        dispatch,
                        onSuccess
                    );
                }
            } else {
                const newData = await fetcher(abortControllerRef.current.signal);

                if (currentRequestId !== lastRequestId) return;

                dispatch({ type: 'SUCCESS', data: newData });
                onSuccess?.(newData);

                updateCache(key, newData, staleTime, setCachedValue);
            }

            hasFetchedOnce.current = 1;
            requestInFlight.current = false;
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                dispatch({ type: 'ERROR', error: err });
                onError?.(err);
                requestInFlight.current = false;
            }
        } finally {
            onSettled?.(getCachedValue<T>(key)?.data ?? null, error ?? null);
        }
    };

    useEffect(() => {
        fetchData();

        usePolling(fetchData, pollInterval ?? 0, requestInFlight);

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            hasFetchedOnce.current = 0;
        };

    }, [key, fetcher]);

    const refetch = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        return fetchData();
    }, [key, fetcher]);

    const isLoading = status === "LOADING";
    const isFetching = status === "FETCHING";
    const isError = status === "ERROR";
    const isSuccess = status === "SUCCESS";

    return { data, error, status,isSuccess, isLoading, isFetching, isError, refetch };
}
