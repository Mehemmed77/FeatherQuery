import { useCallback, useEffect, useRef, useState } from 'react';
import { getCachedValue, setCachedValue } from '../cache';
import { type STATUS } from '../types/queryStatusType';

export default function useQuery<T = unknown>(
    key: string,
    fetcher: (signal: AbortSignal) => Promise<T>,
    options?: {
        pollInterval?: number;
        staleTime?: number;
        onSuccess?: (
            data: T,
            isPolling: boolean,
            isManualRefreshing: boolean
        ) => any;
        onError?: (error: Error, isRefetch: boolean) => any;
        onSettled?: (data: T | null, error: Error | null) => any;
    }
) {
    // States
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<STATUS>('STATIC');

    // Refs
    const hasFetchedOnce = useRef<number>(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const intervalId = useRef<number | null>(null);
    const requestInFlight = useRef<boolean>(false);
    const lastRequestId = useRef<number>(0);

    const {
        pollInterval,
        staleTime = 0,
        onSuccess,
        onError,
        onSettled,
    } = options ?? {};

    const fetchFresh = async (
        currentRequestId: number,
        isPolling: boolean,
        isManualRefreshing: boolean
    ) => {
        const newData = await fetcher(abortControllerRef.current.signal);
        if (currentRequestId !== lastRequestId.current) return;

        const now = Date.now();
        setCachedValue<T>(key, {
            data: newData,
            updatedAt: now,
            cacheTime: staleTime ? staleTime + now : Infinity,
        });
        setData(newData);
        onSuccess?.(newData, isPolling, isManualRefreshing);
    };

    const fetchData = async (isPolling?: boolean) => {
        if (hasFetchedOnce.current === 0 && !getCachedValue<T>(key)) {
            setStatus('LOADING');
            setLoading(true);
        }

        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            const currentRequestId = ++lastRequestId.current;

            if (hasFetchedOnce.current !== 0) {
                setStatus('FETCHING');
                setFetching(true);
            }

            requestInFlight.current = true;

            const cachedData = getCachedValue<T>(key);

            // this boolean value will also be true if the staleTime is zero
            const isDataStale = cachedData
                ? Date.now() - cachedData.updatedAt > staleTime
                : true;

            if (cachedData) {
                setData(cachedData.data);
                if (isPolling) await fetchFresh(currentRequestId, true, false);
                else if (isDataStale)
                    await fetchFresh(currentRequestId, false, true);
            } else {
                const newData = await fetcher(
                    abortControllerRef.current.signal
                );
                if (currentRequestId !== lastRequestId.current) return;

                setData(newData);
                onSuccess?.(newData, false, false);

                const now = Date.now();
                setCachedValue<T>(key, {
                    data: newData,
                    updatedAt: Date.now(),
                    cacheTime: staleTime ? staleTime + now : Infinity,
                });
            }

            if (hasFetchedOnce.current === 0) setLoading(false);

            hasFetchedOnce.current = 1;
            setStatus('SUCCESS');
            setError(null);
            requestInFlight.current = false;
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                setStatus('ERROR');
                setError(error);
                onError?.(error, fetching);
                requestInFlight.current = false;
            }
        } finally {
            setFetching(false);

            onSettled?.(getCachedValue<T>(key)?.data ?? null, error ?? null);
        }
    };

    useEffect(() => {
        fetchData();

        if (pollInterval && pollInterval > 0) {
            intervalId.current = setInterval(() => {
                if (!requestInFlight.current) {
                    fetchData(true);
                }
            }, pollInterval);
        }

        return () => {
            if (intervalId.current) clearInterval(intervalId.current);
            if (abortControllerRef.current) abortControllerRef.current.abort();
            hasFetchedOnce.current = 0;
            intervalId.current = null;
        };
    }, [key, fetcher]);

    const refetch = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        return fetchData();
    }, [key, fetcher]);

    return { data, loading, error, fetching, status, refetch };
}
