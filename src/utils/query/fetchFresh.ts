import { StorageCache } from "../../cache/StorageCache";
import { VolatileCache } from "../../cache/VolatileCache";
import { QueryAction } from "../../core/QueryReducer";
import { updateCache } from "../cache/cacheUtils";

export async function fetchFresh<T>(
    fetcher: (signal: AbortSignal) => Promise<any>,
    abortController: AbortController,
    key: any[],
    currentRequestId: number,
    lastRequestId: number,
    cache: VolatileCache | StorageCache,
    dispatch: React.Dispatch<QueryAction<T>>,
    onSuccess?: (data: any) => any
) {
    const newData = await fetcher(abortController.signal);
    if (currentRequestId !== lastRequestId) return;

    updateCache(key, newData, cache);
    dispatch({ type: 'SUCCESS', data: newData });
    onSuccess?.(newData);
}
