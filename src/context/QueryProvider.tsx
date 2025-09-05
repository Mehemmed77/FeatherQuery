import { useEffect, useRef } from "react";
import { PropsWithChildren } from "react";
import { Cache, PermanentCache } from "../cache";
import QueryContext from "./QueryContext";

interface QueryProviderProps {
    interval?: number;
    defaultCacheTime?: number;
}

const QueryProvider = ({interval = 60000, defaultCacheTime = 300000, children}: PropsWithChildren<QueryProviderProps>) => {
    const intervalId = useRef<number | NodeJS.Timeout | null>(null);
    const cache = new Cache();
    const permanentCache = new PermanentCache();

    useEffect(() => {
        intervalId.current = cache.startCacheGC(interval, defaultCacheTime);

        return () => {
            if (intervalId.current) clearInterval(intervalId.current);
            intervalId.current = null;
        }

    }, [interval]);

    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            ( window as any ).featherCache = {
                get: (key: unknown) => cache.get<any>(key),
                getAll: () => cache.getAll(),
                delete: (key: unknown[]) => cache.delete(key),
                clear: () => cache.deleteAll(),
            }
            console.log("🔍 FeatherQuery cache debugger is available: window.featherCache");
        }
    }, []);

    return (
        <QueryContext.Provider value={{ cache, permanentCache }}>
            {children}
        </QueryContext.Provider>
    );
}

export default QueryProvider;
