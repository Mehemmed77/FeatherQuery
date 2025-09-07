import useFetch from "../hooks/useFetch";
import { FetchOptions } from "../types/fetch";

export class Fetch<T = unknown> {
    private url: string;
    private options: FetchOptions;

    constructor(url: string) {
        this.url = url;
    }

    pollInterval(num: number) {
        this.options.pollInterval = num;
        return this;
    }

    use() {
        return useFetch<T>(this.url, this.options);
    }
}