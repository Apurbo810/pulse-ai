import { Button } from "@/components/ui/button";
import type { ProcessFilter } from "../types";

interface ProcessFilterBarProps {
  filter: ProcessFilter;
  onFilterChange: (filter: ProcessFilter) => void;
}

const filters: {
  label: string;
  value: ProcessFilter;
}[] = [
  { label: "All", value: "all" },
  { label: "Apps", value: "apps" },
  { label: "Background", value: "background" },
  { label: "Windows", value: "windows" },
  { label: "Services", value: "services" },
];

export default function ProcessFilterBar({
  filter,
  onFilterChange,
}: ProcessFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(({ label, value }) => (
        <Button
          key={value}
          variant={filter === value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}