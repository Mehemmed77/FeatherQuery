import { useCallback, useEffect, useRef, useState } from 'react';
import { getCachedValue, setCachedValue } from '../cache';

export default function useQuery<T = unknown>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  options?: { pollInterval: number, keepPreviousData?: boolean }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { pollInterval, keepPreviousData = true } = options;

  const numOfRequestRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalId = useRef<number | null>(null);
  const requestInFlight = useRef<boolean>(false);
  
  const fetchData = async () => {
    if (numOfRequestRef.current === 0 && !getCachedValue<T>(key)) setLoading(true);
      
      try{
          if (abortControllerRef.current) abortControllerRef.current.abort();
          abortControllerRef.current = new AbortController();

          if (!loading) setFetching(true);

          requestInFlight.current = true;

          const cachedData = getCachedValue<T>(key);
          
          if(cachedData) setData(cachedData.data);

          else {
            const newData = await fetcher(abortControllerRef.current.signal);

            setData(newData);
            setCachedValue<T>(key, { data: newData, updatedAt: Date.now() });
          }

          numOfRequestRef.current = 1;
          setError(null);
      }

      catch(error) {
          if(error instanceof Error && error.name !== "AbortError") {
              setError(error);
              if (!keepPreviousData) setData(null);
          };
      }

      finally {
          if (loading) setLoading(false);
          setFetching(false);
          requestInFlight.current = false;
      }
  };

  useEffect(() => {
    numOfRequestRef.current = 0;
    fetchData();

    if(pollInterval && pollInterval > 0) {
        intervalId.current = setInterval(() => {
            if(!requestInFlight.current) fetchData();

        },  pollInterval);
    };

    return () => {
        if(intervalId.current) clearInterval(intervalId.current);
        if(abortControllerRef.current) abortControllerRef.current.abort();
        intervalId.current = null;
    }

  }, [key, fetcher]);

  const refetch = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    fetchData();

  }, [key, fetcher]);

  return { data, loading, error, fetching, refetch };
}
