import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ProcessInfo } from "../../../types/system";

export function useProcesses() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    try {
      setError(null);

      const data = await window.system.getProcesses();

      setProcesses(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load processes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, 3000);

    return () => clearInterval(interval);
  }, [refresh]);

  const filteredProcesses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return processes;

    return processes.filter((process) => {
      return (
        process.name.toLowerCase().includes(query) ||
        process.pid.toString().includes(query) ||
        (process.executablePath?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [processes, search]);

  return {
    processes,
    filteredProcesses,
    loading,
    error,
    refresh,
    search,
    setSearch,
  };
}