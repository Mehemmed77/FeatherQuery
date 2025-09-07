import { StorageCache } from '../cache/StorageCache';
import { VolatileCache } from '../cache/VolatileCache';
import { CacheMode } from './cache';
import { STATUS } from './status';

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

export type Config<TResponse, TVariables> =
    | {
          mutateFn: (variables: TVariables) => Promise<TResponse>;
          url?: never;
          method?: never;
          headers?: never;
      }
    | {
          mutateFn?: never;
          url: string;
          method: MethodTypes;
          headers?: HeadersInit;
      };

export type Options<TResponse, TError extends Error, TVariables> = {
    onSuccess?: (response: TResponse, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    onSettled?: (
        response: TResponse | null,
        error: TError | null,
        variables: TVariables
    ) => void;

    optimisticUpdate?: (
        cache: VolatileCache | StorageCache,
        variables: TVariables
    ) => any;
    rollback?: (
        cache: VolatileCache | StorageCache,
        variables: TVariables
    ) => any;
    retries?: number;
    retryDelay?: (attempt: number) => number;
    cacheMode?: CacheMode;
    invalidateKeys?: any[];
};

export type MethodTypes = 'POST' | 'PUT' | 'PATCH' | 'DELETE';
