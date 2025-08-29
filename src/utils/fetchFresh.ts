import { QueryAction } from '../reducers/QueryReducer';
import { updateCache } from './cacheUtils';

export async function fetchFresh<T>(
    fetcher: (signal: AbortSignal) => Promise<T>,
    abortController: AbortController,
    key: string,
    staleTime: number,
    currentRequestId: number,
    lastRequestId: number,
    setCachedValue: any,
    dispatch: React.Dispatch<QueryAction<T>>,
    onSuccess?: (data: T) => any
) {
    const newData = await fetcher(abortController.signal);
    if (currentRequestId !== lastRequestId) return;

    updateCache(key, newData, staleTime, setCachedValue);
    dispatch({ type: 'SUCCESS', data: newData });
    onSuccess?.(newData);
}
