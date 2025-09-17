import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import usePolling from '../utils/query/usePolling';
import { FetchOptions } from '../types/fetch';
import { queryReducer } from '../core/QueryReducer';

export default function useFetch<T = unknown>(url: string, options?: FetchOptions) {
    const [trigger, setTrigger] = useState<number>(0);

    const abortControllerRef = useRef<AbortController | null>(null);
    const requestInFlight = useRef<boolean>(false);

    const { pollInterval } = options ?? {};
    const [state, dispatch] = useReducer(queryReducer<T>, {
        data: null,
        response: null,
        error: null,
        status: "IDLE",
    });

    const fetchData = useCallback(async () => {
        dispatch({ type: "LOADING" });

        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();
            requestInFlight.current = true;

            const response = await fetch(url, {
                signal: abortControllerRef.current.signal,
            });
            if (!response.ok)
                throw new Error(`Error occurred: ${response.status}`);

            const json = await (response.json() as T);
            dispatch({ type: "SUCCESS", data: json });
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                dispatch({ type: "ERROR", error: error });
            }
        } finally {
            requestInFlight.current = false;
        }

    }, [url]);

    usePolling(fetchData, pollInterval ?? 0, requestInFlight);

    useEffect(() => {
        fetchData();

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [url, trigger, pollInterval]);

    const refetch = () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setTrigger((prev) => prev + 1);
    };

    return {
        data: state.data,
        status: state.status,
        error: state.error,
        isLoading: state.status === "LOADING",
        isIdle: state.status === "IDLE",
        refetch,
    };
}
