import { useMemo } from "react";

export default function memoizeKeys(keys: any[]) {
    const memoizedKeys = useMemo(() => {
        return keys
    }, [...keys])

    return memoizedKeys;
}