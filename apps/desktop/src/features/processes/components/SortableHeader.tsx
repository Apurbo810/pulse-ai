import type { SortDirection, SortField } from "../types";

interface SortableHeaderProps {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}

export default function SortableHeader({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const active = sortField === field;

  const arrow = !active
    ? "↕"
    : sortDirection === "asc"
    ? "▲"
    : "▼";

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1 font-semibold hover:text-primary transition-colors ${className}`}
    >
      <span>{label}</span>
      <span className="text-xs">{arrow}</span>
    </button>
  );
}