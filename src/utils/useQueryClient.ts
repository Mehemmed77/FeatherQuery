import { useContext } from "react";
import QueryContext from "../context/QueryContext";
import { deleteCachedValue, getCachedValue, setCachedValue } from "../cache";

export default function useQueryClient() {
    const context = useContext(QueryContext);
    if (!context) throw new Error("useQueryClient must be used within QueryProvider");

    return {
        setCachedValue: setCachedValue,
        getCachedValue: getCachedValue,
        deleteCachedValue: deleteCachedValue
    }
}