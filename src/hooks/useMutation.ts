import { useCallback, useEffect, useReducer, useRef } from 'react';
import { MutateFn, MutateOptions } from '../types/UseMutateTypes';
import useRequestIdTracker from '../utils/useLastRequestId';
import { queryReducer } from '../reducers/queryReducer';
import useQueryClient from '../utils/useQueryClient';

export default function useMutation<TData, TError extends Error, TVariables>(
    options: MutateOptions<TData, TError, TVariables>
): MutateFn<TData, TError, TVariables> {
    const {
        mutateFn,
        url,
        method,
        headers,
        onSuccess,
        onError,
        onSettled,
        invalidateKeys,
        optimisticUpdate,
        rollback,
    } = options;
    const { lastRequestIdRef, incrementAndGet } = useRequestIdTracker();

    let executeMutation: (variables: TVariables) => Promise<TData>;

    if (mutateFn) executeMutation = mutateFn;
    else if (url && method) {
        const requestHeaders = {
            'Content-type': 'application/json',
            ...headers,
        };
        executeMutation = async (variables: TVariables) => {
            return await fetch(url, {
                method: method,
                body: JSON.stringify(variables),
                headers: requestHeaders,
            }).then((data) => data.json() as Promise<TData>);
        };
    } else {
        throw new Error('You must provide either mutateFn or url+method');
    }

    // STATES
    const [state, dispatch] = useReducer(queryReducer<TData, TError>, {
        data: null,
        error: null,
        status: 'IDLE',
    });

    const { cache, permanentCache } = useQueryClient();
    const hasOptimisticallyUpdated = useRef<boolean>(false);
    const isUnmounted = useRef<boolean>(false);

    const execute = useCallback(
        async (variables: TVariables): Promise<TData> => {
            let tempData: TData | null = null;
            let tempError: TError | null = null;

            if (isUnmounted.current) dispatch({ type: 'LOADING' });
            const tempRequestID = incrementAndGet();

            try {
                if(optimisticUpdate) {
                    optimisticUpdate(permanentCache, variables);
                    hasOptimisticallyUpdated.current = true;
                };

                const newData = await executeMutation(variables);

                if (tempRequestID !== lastRequestIdRef.current) return;

                tempData = newData;
                if(isUnmounted.current) dispatch({ type: 'SUCCESS', data: newData });

                onSuccess?.(newData, variables);

                if (invalidateKeys) {
                    invalidateKeys.forEach((key) => cache.delete(key));
                }

                return newData;

            } catch (e: unknown) {
                tempError = e as TError;
                if(isUnmounted.current) dispatch({ type: 'ERROR', error: tempError });

                onError?.(tempError, variables);

                if(rollback && hasOptimisticallyUpdated.current) {
                    rollback(permanentCache, variables);
                    hasOptimisticallyUpdated.current = false;
                }

                throw tempError;    
            } finally {
                onSettled?.(tempData, tempError, variables);
            }
        },
        [executeMutation, onSuccess, onError, onSettled, invalidateKeys]
    );

    useEffect(() => {
        return () => {
            isUnmounted.current = true;
        }
    }, []);

    const mutate = (variables: TVariables) =>
        execute(variables).catch(() => {});

    const mutateAsync = (variables: TVariables) => execute(variables);

    const reset = () => dispatch({ type: 'RESET', status: 'IDLE' });

    const { data, status } = state;
    const error = state.error as TError;
    const isLoading = status === "LOADING";
    const isError = status === "ERROR";
    const isSuccess = status === "SUCCESS";
    const isIdle = status === "IDLE";

    return { mutate, mutateAsync, status, data, error, isLoading, isError, isIdle, isSuccess, reset };
}
