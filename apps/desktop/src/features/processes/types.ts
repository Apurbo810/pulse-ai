export type SortField =
  | "name"
  | "cpu"
  | "gpu"
  | "memory"
  | "disk"
  | "pid";

export type SortDirection = "asc" | "desc";

export type ProcessFilter =
  | "all"
  | "apps"
  | "background"
  | "windows"
  | "services";