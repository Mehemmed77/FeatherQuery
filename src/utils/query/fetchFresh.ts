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
    requestIsComingFrom: string,
    onSuccess?: (data: any) => any
) {
    const newData = await fetcher(abortController.signal);
    if (currentRequestId !== lastRequestId) return;

    updateCache(key, newData, cache);

    if (requestIsComingFrom === "query") {
        dispatch({ type: 'SUCCESS', data: newData });
        onSuccess?.(newData);
    }

    else {
        const entity = {}
    }

}
