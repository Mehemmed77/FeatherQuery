import { StorageCache } from '../cache/StorageCache';
import { VolatileCache } from '../cache/VolatileCache';
import useMutation from '../hooks/useMutation';
import { CacheMode } from '../types/cache';
import { Config, Options } from '../types/mutation';

export default class Mutation<TResponse = unknown, TError extends Error = Error, TVariables = unknown> {
    private config: Config<TResponse, TVariables>;
    private options: Options<TResponse, TError, TVariables>;

    constructor(config: Config<TResponse, TVariables>) {
        this.config = config;
    }

    optimisticUpdate(
        callback: (
            cache: VolatileCache | StorageCache,
            variables: TVariables
        ) => any
    ) {
        this.options.optimisticUpdate = callback;
        return this;
    }

    rollback(
        callback: (
            cache: VolatileCache | StorageCache,
            variables: TVariables
        ) => any
    ) {
        this.options.rollback = callback;
        return this;
    }

    success(onSuccess: (response: TResponse, variables: TVariables) => void) {
        this.options.onSuccess = onSuccess;
        return this;
    }

    error(onError: (error: TError, variables: TVariables) => void) {
        this.options.onError = onError;
        return this;
    }

    settled(
        onSettled: (
            response: TResponse | null,
            error: TError | null,
            variables: TVariables
        ) => void
    ) {
        this.options.onSettled = onSettled;
        return this;
    }

    retries(num: number) {
        this.options.retries = num;
        return this;
    }

    retryDelay(callback: (attempt: number) => number) {
        this.options.retryDelay = callback;
        return this;
    }

    cacheMode(mode: CacheMode) {
        this.options.cacheMode = mode;
        return this;
    }

    invalidateKeys(keys: any[]) {
        this.options.invalidateKeys = keys;
        return this;
    }

    use() {
        return useMutation<TResponse, TError, TVariables>(this.config, this.options);
    }
}
