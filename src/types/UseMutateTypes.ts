import { CacheMode } from './CacheModeType';
import { STATUS } from './queryStatusType';

export interface MutateFn<TResponse, TError extends Error, TVariables> {
    mutate: (variables: TVariables) => void;
    mutateAsync: (variables: TVariables) => Promise<TResponse>;

    status: STATUS;

    response: TResponse | null;
    error: TError | null;

    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    isIdle: boolean;

    reset: () => void;
}

type Options<TResponse, TError extends Error, TVariables> = {
    onSuccess?: (response: TResponse, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    onSettled?: (
        response: TResponse | null,
        error: TError | null,
        variables: TVariables
    ) => void;

    optimisticUpdate?: (cache: Cache, variables: TVariables) => any;
    rollback?: (cache: Cache, variables: TVariables) => any;
    retries?: number;
    retryDelay?: (attempt: number) => number;
    cacheMode?: CacheMode;
};

export type MutateOptions<TResponse, TError extends Error, TVariables> =
    | ({
          mutateFn: (variables: TVariables) => Promise<TResponse>;
          invalidateKeys?: any[];
          url?: never;
          method?: never;
          headers?: never;
      } & Options<TResponse, TError, TVariables>)
    | ({
          invalidateKeys?: any[];
          url: string;
          method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
          mutateFn?: never;
          headers?: HeadersInit;
      } & Options<TResponse, TError, TVariables>);
