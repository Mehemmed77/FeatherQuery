import { VolatileCache } from '../cache/VolatileCache';
import { QueryAction } from '../reducers/queryReducer';
import { updateCache } from './cacheUtils';

export async function fetchFresh<T>(
    fetcher: (signal: AbortSignal) => Promise<T>,
    abortController: AbortController,
    key: any[],
    staleTime: number,
    currentRequestId: number,
    lastRequestId: number,
    cache: VolatileCache,
    dispatch: React.Dispatch<QueryAction<T>>,
    onSuccess?: (data: T) => any
) {
    const newData = await fetcher(abortController.signal);
    if (currentRequestId !== lastRequestId) return;

    updateCache(key, newData, staleTime, cache);
    dispatch({ type: 'SUCCESS', data: newData });
    onSuccess?.(newData);
}
