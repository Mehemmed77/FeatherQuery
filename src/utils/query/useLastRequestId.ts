import { useRef } from "react";

export default function useRequestIdTracker() {
    const lastRequestIdRef = useRef<number>(0);

    const incrementAndGet = () => {
        lastRequestIdRef.current = lastRequestIdRef.current + 1;
        return lastRequestIdRef.current;
    }
    
    const reset = () => lastRequestIdRef.current = 0;

    return { lastRequestIdRef: lastRequestIdRef, incrementAndGet, reset }
}