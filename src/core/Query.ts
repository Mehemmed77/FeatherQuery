import useQuery from "../hooks/useQuery";
import { CacheMode } from "../types/cache";
import { QueryOptions } from "../types/query";

export class Query<T = unknown> {
    private key: any[];
    private fetcher: (signal: AbortSignal) => Promise<T>;
    private options: QueryOptions<T>;

    constructor(key: any[], fetcher: (signal: AbortSignal) => Promise<T>) {
        this.key = key;
        this.fetcher = fetcher;
    }

    pollInterval(num: number) {
        this.options.pollInterval = num;
        return this;
    }

    staleTime(num: number) {
        this.options.staleTime = num;
        return this;
    }
    
    success(onSuccess: (data: T) => any) {
        this.options.onSuccess = onSuccess;
        return this;
    }

    error(onError: (error: Error) => any) {
        this.options.onError = onError;
        return this;
    }

    settled(onSettled: (data: T | null, error: Error | null) => any) {
        this.options.onSettled = onSettled;
        return this;
    }

    cacheMode(mode: CacheMode) {
        this.options.cacheMode = mode;
        return this;
    }

    use() {
        return useQuery<T>(this.key, this.fetcher, this.options);
    }
}