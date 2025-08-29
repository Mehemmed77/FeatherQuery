import { useRef } from "react";

export default function useRequestIdTracker() {
    const lastRequestIdRef = useRef<number>(0);

    const incrementAndGet = () => {
        return ++lastRequestIdRef.current;
    }
    
    const reset = () => lastRequestIdRef.current = 0;

    const lastRequestId = lastRequestIdRef.current

    return { lastRequestId, incrementAndGet, reset }
}