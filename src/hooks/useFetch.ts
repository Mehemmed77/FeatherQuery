import { useCallback, useEffect, useRef, useState } from 'react';

export default function useFetch<T = unknown>(
    url: string,
    option?: { pollInterval?: number }
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [trigger, setTrigger] = useState<number>(0);

    const abortControllerRef = useRef<AbortController | null>(null);
    const intervalId = useRef<number | null>(null);
    const requestInFlight = useRef<boolean>(false);

    const { pollInterval } = option ?? {};

    const fetchData = useCallback(async () => {
            setLoading(true);

            try {
                if (abortControllerRef.current) abortControllerRef.current.abort();
                abortControllerRef.current = new AbortController();
                requestInFlight.current = true;

                const response = await fetch(url, { signal: abortControllerRef.current.signal });
                if(!response.ok) throw new Error(`Error occurred: ${response.status}`);

                const json = response as T;
                setError(null);
                setLoading(false);
                setData(json);
            }

            catch (error) {
                if (
                    error instanceof Error &&
                    error.name !== 'AbortError') {
                    setData(null);
                    setError(error);
                }
            } finally {
                requestInFlight.current = false;
            }
        }, [url]);

    useEffect(() => {
        fetchData();

        if (pollInterval && pollInterval !== 0) {
            intervalId.current = setInterval(() => {
                if (!requestInFlight.current) fetchData();
            }, pollInterval);
        }

        return () => {
            if (intervalId.current) {
                clearInterval(intervalId.current);
                intervalId.current = null;
            }

            if(abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [url, trigger, pollInterval]);

    const refetch = () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setTrigger((prev) => prev + 1);
    };

    return { data, loading, error, refetch };
}
