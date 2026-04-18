import { useEffect, useState } from "react";

export function useSessionTimer(endAt) {
  const [remaining, setRemaining] = useState(() => {
    if (!endAt) return 0;
    return Math.max(0, endAt - Date.now());
  });

  useEffect(() => {
    if (!endAt) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, endAt - Date.now());
      setRemaining(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [endAt]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return {
    remaining,
    minutes,
    seconds,
    isExpired: remaining <= 0,
  };
}