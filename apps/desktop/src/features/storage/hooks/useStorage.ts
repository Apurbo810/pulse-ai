import { useEffect, useState } from "react";

import type {
  StorageSummary,
  StorageDevice,
} from "@/types/system";

export function useStorage() {
  const [summary, setSummary] = useState<StorageSummary | null>(null);
  const [devices, setDevices] = useState<StorageDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    let cancelled = false;

    async function loadStorage() {
        try {
        const [summary, devices] = await Promise.all([
            window.system.getStorage(),
            window.system.getStorageDevices(),
        ]);

        if (cancelled) return;

        setSummary(summary);
        setDevices(devices);
        } catch (err) {
        console.error(err);

        if (!cancelled) {
            setError("Failed to load storage information.");
        }
        } finally {
        if (!cancelled) {
            setLoading(false);
        }
        }
    }

    loadStorage();

    return () => {
        cancelled = true;
    };
    }, []);

  return {
    summary,
    devices,
    loading,
    error,
  };
}