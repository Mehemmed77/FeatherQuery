import { useEffect, useRef } from 'react';

export default function usePolling(
    callback: (isPolling?: boolean) => void,
    pollInterval: number,
    requestInFlightRef: React.RefObject<boolean>
) {
    const intervalId = useRef<number | null>(null);

    useEffect(() => {
        if (pollInterval > 0) {
            intervalId.current = setInterval(() => {
                if (!requestInFlightRef.current) callback(true);
            }, pollInterval);
        }

        return () => {
            if (intervalId.current) {
                clearInterval(intervalId.current);
                intervalId.current = null;
            }
        };
    }, [callback, pollInterval, requestInFlightRef]);
}
