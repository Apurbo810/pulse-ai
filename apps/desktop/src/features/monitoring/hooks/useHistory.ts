import { useEffect, useState } from "react";

const MAX_HISTORY = 60;

export function useHistory(value: number) {
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    setHistory((prev) => {
      const next = [...prev, value];

      if (next.length > MAX_HISTORY) {
        next.shift();
      }

      return next;
    });
  }, [value]);

  return history;
}