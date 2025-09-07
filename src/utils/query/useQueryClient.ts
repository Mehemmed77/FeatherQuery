import { useContext } from "react";
import { CacheMode } from "../../types/cache";
import QueryContext from "../../context/QueryContext";

export default function useQueryClient(cacheMode: CacheMode) {
    const context = useContext(QueryContext);
    if (!context) throw new Error("useQueryClient must be used within QueryProvider");

    function getCache(mode: CacheMode | null | undefined) {
        if (!mode || mode === 'volatile') return context.volatileCache;
        if (mode === 'session') return context.sessionCache;
        return context.permanentCache;
    }

    return {
        cache: getCache(cacheMode),
    }
}