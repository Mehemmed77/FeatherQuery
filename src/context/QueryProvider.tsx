import { useEffect, useRef } from "react";
import { PropsWithChildren } from "react";
import startCacheGC from "../cache";
import QueryContext from "./QueryContext";
import { getCachedValue, deleteCachedValue, setCachedValue } from "../cache";

interface QueryProviderProps {
    interval: number;
    defaultCacheTime: number;
}

const QueryProvider = ({interval = 60000, defaultCacheTime = 300000, children}: PropsWithChildren<QueryProviderProps>) => {
    const intervalId = useRef<number | null>(null);

    useEffect(() => {
        intervalId.current = startCacheGC(interval, defaultCacheTime);

        return () => {
            if (intervalId.current) clearInterval(intervalId.current);
            intervalId.current = null;
        }

    }, [interval]);

    return (
        <QueryContext.Provider value={{setCachedValue, deleteCachedValue, getCachedValue}}>
            {children}
        </QueryContext.Provider>
    );
}

export default QueryProvider;
