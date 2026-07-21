import type { ProcessFilter } from "../types";
import type { SortDirection, SortField } from "../types";

export interface ProcessPreferences {
  refreshInterval: number;
  filter: ProcessFilter;
  sortField: SortField;
  sortDirection: SortDirection;
}

const STORAGE_KEY = "pulse-process-preferences";

export function loadPreferences(): ProcessPreferences | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePreferences(preferences: ProcessPreferences) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(preferences)
  );
}