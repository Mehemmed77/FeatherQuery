import { useCallback, useRef, useState } from 'react';
import { MutateFn, MutateOptions } from '../types/UseMutateTypes';
import { STATUS } from '../types/mutateStatusType';
import useRequestIdTracker from '../utils/useLastRequestId';

export default function useMutation<TData, TError, TVariables>(
    options: MutateOptions<TData, TError, TVariables>
): MutateFn<TData, TError, TVariables> {
    const { mutateFn, url, method, headers, onSuccess, onError, onSettled } = options;
    const { lastRequestId, incrementAndGet } = useRequestIdTracker();

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
    const [status, setStatus] = useState<STATUS>("IDLE");
    const [data, setData] = useState<TData | null>(null);
    const [error, setError] = useState<TError | null>(null);

    const execute = useCallback(async (variables: TVariables): Promise<TData> => {
        let tempData: TData | null = null;
        let tempError: TError | null = null;
    
        setStatus("LOADING");
        const tempRequestID = incrementAndGet();
        
        try {
            const data = await executeMutation(variables);
    
            if (tempRequestID !== lastRequestId) return;
    
            tempData = data;
            setStatus("SUCCESS");
            setError(null);
            setData(data);
            onSuccess?.(data, variables);
            
            return data;
        }
        
        catch(e: unknown) {
            tempError = e as TError;
            setError(tempError);
            onError?.(tempError, variables);
            setStatus("ERROR");
            throw tempError;
        }
        
        finally {
            onSettled?.(tempData, tempError, variables);
        }
    }, [executeMutation]);
    
    const mutate = (variables: TVariables) => execute(variables).catch(() => {});

    const mutateAsync = (variables: TVariables) => execute(variables);
    
    const reset = () => {
        setStatus("IDLE");
        setData(null);
        setError(null);
    }

    return { mutate, mutateAsync, status, data, error, reset };
}
