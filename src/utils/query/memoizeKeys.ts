import { useMemo } from "react";

export default function useMemoizedKeys(keys: any) {
    return useMemo(() => keys, [typeof keys === "object" ? JSON.stringify(keys) : keys]);
}
