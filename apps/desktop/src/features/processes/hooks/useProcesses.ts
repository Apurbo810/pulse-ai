import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ProcessInfo } from "../../../types/system";
import type { ProcessFilter, SortDirection, SortField } from "../types";

export function useProcesses() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] =useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [sortField, setSortField] =
    useState<SortField>("cpu");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [filter, setFilter] =
    useState<ProcessFilter>("all");

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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, 3000);

    return () => clearInterval(interval);
  }, [refresh]);

const searchedProcesses = useMemo(() => {
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

const filteredProcesses = useMemo(() => {
  switch (filter) {
    case "apps":
      return searchedProcesses.filter(
        (p) =>
          !!p.executablePath &&
          !p.name.toLowerCase().startsWith("svchost")
      );

    case "windows":
      return searchedProcesses.filter((p) =>
        p.executablePath?.toLowerCase().includes("windows")
      );

    case "background":
      return searchedProcesses.filter(
        (p) =>
          p.name.toLowerCase().startsWith("svchost") ||
          p.name.toLowerCase().startsWith("runtimebroker")
      );

    case "services":
      return searchedProcesses.filter((p) =>
        p.name.toLowerCase().includes("service")
      );

    default:
      return searchedProcesses;
  }
}, [searchedProcesses, filter]);

  



  const sortedProcesses = useMemo(() => {
    const sorted = [...filteredProcesses];

    sorted.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      switch (sortField) {
        case "name":
          return a.name.localeCompare(b.name) * direction;

        case "cpu":
          return (a.cpu - b.cpu) * direction;

        case "gpu":
          return ((a.gpu ?? 0) - (b.gpu ?? 0)) * direction;

        case "memory":
          return (a.memory - b.memory) * direction;

        case "disk":
          return ((a.disk ?? 0) - (b.disk ?? 0)) * direction;

        case "pid":
          return (a.pid - b.pid) * direction;

        default:
          return 0;
      }
    });

    return sorted;
  }, [filteredProcesses, sortField, sortDirection]);

  return {
    processes,
    filteredProcesses: sortedProcesses,

    loading,
    error,

    refresh,

    search,
    setSearch,

    sortField,
    sortDirection,
    toggleSort,

    filter,
    setFilter,
  };
}