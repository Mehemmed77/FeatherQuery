import { useEffect, useRef } from "react";
import { PropsWithChildren } from "react";
import startCacheGC, { getAll } from "../cache";
import QueryContext from "./QueryContext";
import { getCachedValue, deleteCachedValue, setCachedValue } from "../cache";

interface QueryProviderProps {
    interval?: number;
    defaultCacheTime?: number;
}

const QueryProvider = ({interval = 60000, defaultCacheTime = 300000, children}: PropsWithChildren<QueryProviderProps>) => {
    const intervalId = useRef<number | NodeJS.Timeout | null>(null);

    useEffect(() => {
        intervalId.current = startCacheGC(interval, defaultCacheTime);

        return () => {
            if (intervalId.current) clearInterval(intervalId.current);
            intervalId.current = null;
        }

    }, [interval]);

    useEffect(() => {
        if (process.env.NODE_ENV !== "production") {
            ( window as any ).featherCache = {
                get: (key: unknown) => getCachedValue<any>(key),
                getAll: () => getAll(),
                delete: (key: unknown[]) => deleteCachedValue(key),
                clear: () => deleteCachedValue(),
            }
            console.log("🔍 FeatherQuery cache debugger is available: window.featherCache");
        }
    }, []);

    return (
        <QueryContext.Provider value={{setCachedValue, deleteCachedValue, getCachedValue}}>
            {children}
        </QueryContext.Provider>
    );
}

export default QueryProvider;
