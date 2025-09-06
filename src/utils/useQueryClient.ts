import { useContext } from "react";
import QueryContext from "../context/QueryContext";

export default function useQueryClient() {
    const context = useContext(QueryContext);
    if (!context) throw new Error("useQueryClient must be used within QueryProvider");

    return {
        cache: context.cache,     
    }
}