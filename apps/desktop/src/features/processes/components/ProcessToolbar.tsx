import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RefreshIntervalSelect from "./RefreshIntervalSelect";

interface ProcessToolbarProps {
  processCount: number;
  search: string;

  refreshInterval: number;
  onRefreshIntervalChange: (value: number) => void;

  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export default function ProcessToolbar({
  processCount,
  search,
  onSearchChange,
  onRefresh,
  refreshInterval,
  onRefreshIntervalChange,
}: ProcessToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      {/* Left */}
      <div>
        <h1 className="text-2xl font-bold">Processes</h1>
        <p className="text-sm text-muted-foreground">
          {processCount} running processes
        </p>
      </div>

      {/* Right */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onRefresh}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <RefreshIntervalSelect
            value={refreshInterval}
            onChange={onRefreshIntervalChange}
          />

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search processes..."
              className="pl-9"
            />
          </div>
        </div>
    </div>
  );
}