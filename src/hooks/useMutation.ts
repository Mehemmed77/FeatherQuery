import { useCallback, useEffect, useReducer, useRef } from 'react';
import { Config, MutateFn, Options } from '../types/mutation';
import useRequestIdTracker from '../utils/query/useLastRequestId';
import { queryReducer } from '../core/QueryReducer';
import useQueryClient from '../utils/query/useQueryClient';
import { defaultRetryDelayFunction } from '../constants/constant';

export default function useMutation<
    TResponse = unknown,
    TError extends Error = Error,
    TVariables = unknown
>(
    config: Config<TResponse, TVariables>,
    options?: Options<TResponse, TError, TVariables>
): MutateFn<TResponse, TError, TVariables> {
    const { mutateFn, url, method, headers } = config;
    const {
        onSuccess,
        onError,
        onSettled,
        invalidateKeys,
        optimisticUpdate,
        rollback,
        retries = 0,
        retryDelay = defaultRetryDelayFunction,
        cacheMode,
    } = options;
    const { lastRequestIdRef, incrementAndGet } = useRequestIdTracker();

    let executeMutation: (variables: TVariables) => Promise<TResponse>;

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
            }).then((data) => data.json() as Promise<TResponse>);
        };
    }

    // STATES
    const [state, dispatch] = useReducer(queryReducer<TResponse, TError>, {
        data: null,
        response: null,
        error: null,
        status: 'IDLE',
    });

    const { cache } = useQueryClient(cacheMode);
    const hasOptimisticallyUpdated = useRef<boolean>(false);
    const retriesRef = useRef<number>(retries);
    const retryTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);
    const isMounted = useRef<boolean>(true);

    const execute = useCallback(
        async (variables: TVariables): Promise<TResponse> => {
            let tempResponse: TResponse | null = null;
            let tempError: TError | null = null;

            if (!isMounted.current) return;

            dispatch({ type: 'LOADING' });
            const tempRequestID = incrementAndGet();

            try {
                if (optimisticUpdate) {
                    optimisticUpdate(cache, variables);
                    hasOptimisticallyUpdated.current = true;
                }

                const response = await executeMutation(variables);

                if (tempRequestID !== lastRequestIdRef.current) return;

                tempResponse = response;
                dispatch({ type: 'SUCCESS_RESPONSE', response: response });

                onSuccess?.(response, variables);

                if (invalidateKeys) {
                    invalidateKeys.forEach((key) => cache.delete(key));
                }

                return response;
            } catch (e: unknown) {
                if (e instanceof Error && e.name !== 'AbortError') {
                    tempError = e as TError;

                    if (retriesRef.current > 0) {
                        const attempts = retries - retriesRef.current + 1;
                        retriesRef.current = retriesRef.current - 1;

                        retryTimeoutRef.current = setTimeout(
                            () => execute(variables),
                            retryDelay(attempts)
                        );

                        onError?.(tempError, variables);

                        return;
                    }

                    dispatch({ type: 'ERROR', error: tempError });

                    if (rollback && hasOptimisticallyUpdated.current) {
                        rollback(cache, variables);
                        hasOptimisticallyUpdated.current = false;
                    }

                    throw tempError;
                }
            } finally {
                onSettled?.(tempResponse, tempError, variables);
            }
        },
        [executeMutation, onSuccess, onError, onSettled, invalidateKeys]
    );

    const runMutation = useCallback(
        (variables: TVariables) => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            retriesRef.current = retries;
            return execute(variables);
        },
        [execute, retries]
    );

    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
            // isMounted.current = false;
        };
    }, []);

    const mutate = (variables: TVariables) =>
        runMutation(variables).catch(() => {});

    const mutateAsync = (variables: TVariables) => runMutation(variables);

    const reset = () => dispatch({ type: 'RESET', status: 'IDLE' });

    const { response, status } = state;
    const error = state.error as TError;
    const isLoading = status === 'LOADING';
    const isError = status === 'ERROR';
    const isSuccess = status === 'SUCCESS';
    const isIdle = status === 'IDLE';

    return {
        mutate,
        mutateAsync,
        status,
        response,
        error,
        isLoading,
        isError,
        isIdle,
        isSuccess,
        reset,
    };
}
