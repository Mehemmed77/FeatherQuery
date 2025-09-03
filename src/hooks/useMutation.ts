import { useCallback, useReducer } from 'react';
import { MutateFn, MutateOptions } from '../types/UseMutateTypes';
import useRequestIdTracker from '../utils/useLastRequestId';
import { queryReducer } from '../reducers/queryReducer';
import useQueryClient from '../utils/useQueryClient';

export default function useMutation<TData, TError extends Error, TVariables>(
    options: MutateOptions<TData, TError, TVariables>
): MutateFn<TData, TError, TVariables> {
    const { mutateFn, url, method, headers, onSuccess, onError, onSettled, invalidateKeys } = options;
    const { lastRequestIdRef, incrementAndGet } = useRequestIdTracker();

    let executeMutation: (variables: TVariables) => Promise<TData>;

    if (mutateFn) executeMutation = mutateFn;
    else if (url && method){
        const requestHeaders = {"Content-type": "application/json",...headers}
        executeMutation = async (variables: TVariables) => {
            return await fetch(url, {
                method: method,
                body: JSON.stringify(variables),
                headers: requestHeaders,
            }).then((data) => data.json() as Promise<TData>);
        }
    } else{
        throw new Error("You must provide either mutateFn or url+method");
    }

    // STATES
    const [state, dispatch] = useReducer(queryReducer<TData, TError>, 
        {data: null,error: null,status: "IDLE"}
    )

    const { cache } = useQueryClient();

    const { data, status } = state;
    const error = state.error as TError;

    const execute = useCallback(async (variables: TVariables): Promise<TData> => {
        let tempData: TData | null = null;
        let tempError: TError | null = null;
    
        dispatch({type: "LOADING"});
        const tempRequestID = incrementAndGet();
        
        try {
            const newData = await executeMutation(variables);
    
            if (tempRequestID !== lastRequestIdRef.current) return;

            tempData = newData;
            dispatch({type: "SUCCESS", data: newData});
            onSuccess?.(newData, variables);

            if (invalidateKeys) {
                invalidateKeys.forEach(key => cache.delete(key));
            }
            
            return newData;
        }
        
        catch(e: unknown) {
            tempError = e as TError;
            dispatch({type: "ERROR", error: tempError});
            onError?.(tempError, variables);
            throw tempError;
        }
        
        finally {
            onSettled?.(tempData, tempError, variables);
        }
    }, [executeMutation, onSuccess, onError, onSettled, invalidateKeys]);
    
    const mutate = (variables: TVariables) => execute(variables).catch(() => {});

    const mutateAsync = (variables: TVariables) => execute(variables);
    
    const reset = () => dispatch({type: "RESET", status: "IDLE"})

    return { mutate, mutateAsync, status, data, error, reset };
}
