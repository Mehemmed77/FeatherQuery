import { useEffect, useRef } from 'react';
import { PropsWithChildren } from 'react';
import QueryContext from './QueryContext';
import { CacheManager } from '../cache/CacheManager';

interface QueryProviderProps {
    interval?: number;
    defaultCacheTime?: number;
}

const QueryProvider = ({
    interval = 60_000,
    defaultCacheTime = 300_000,
    children,
}: PropsWithChildren<QueryProviderProps>) => {
    const intervalId = useRef<number | NodeJS.Timeout | null>(null);

    const volatileCache = new CacheManager().volatileCache;
    const sessionCache = new CacheManager().sessionCache;
    const permanentCache = new CacheManager().permanentCache;

    useEffect(() => {
        intervalId.current = volatileCache.startCacheGC(interval, defaultCacheTime);

        return () => {
            if (intervalId.current) clearInterval(intervalId.current);
            intervalId.current = null;
        };
    }, [interval]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            (window as any).featherCache = {
                get: (key: unknown) => volatileCache.get<any>(key),
                getAll: () => volatileCache.getAll(),
                delete: (key: unknown[]) => volatileCache.delete(key),
                clear: () => volatileCache.deleteAll(),
            };
            console.log(
                '🔍 FeatherQuery cache debugger is available: window.featherCache'
            );
        }
    }, []);

    return (
        <QueryContext.Provider value={{ volatileCache, sessionCache, permanentCache }}>
            {children}
        </QueryContext.Provider>
    );
};

export default QueryProvider;
