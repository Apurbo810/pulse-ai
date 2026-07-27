//features/processes/components/tableProcessRow.tsx

import { ChevronDown, ChevronRight } from "lucide-react";
import ApplicationIcon from "@/components/shared/ApplicationIcon";
import type { ProcessInfo } from "@/types/system";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";

import ProcessActions from "../actions/ProcessActions";

interface ProcessRowProps {
  process: ProcessInfo;
  selected: boolean;
  onSelect: () => void;

  onEndProcess: (pid: number) => Promise<void>;

  onOpenContextMenu: (
    x: number,
    y: number,
    process: ProcessInfo
  ) => void;
}

function formatDiskActivity(bytesPerSecond: number) {
  return bytesPerSecond >= 1024 * 1024
    ? `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
    : `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
}

export default function ProcessRow({
  process,
  selected,
  onSelect,
  onEndProcess,
  onOpenContextMenu,
}: ProcessRowProps) {
  return (
    <>

      <TableRow
        onClick={onSelect}
            onContextMenu={(e) => {
      e.preventDefault();

      onOpenContextMenu(
        e.clientX,
        e.clientY,
        process
      );
    }}
        className={`
          cursor-pointer
          transition-colors
          hover:bg-muted/50
          ${selected ? "bg-muted" : ""}
        `}
      >
        
        <TableCell className="py-2">
          <div className="flex items-center gap-3">
            {selected ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}

            <ApplicationIcon
              executablePath={process.executablePath}
              size={24}
            />

            <div className="min-w-0">
              <p className="truncate font-medium">
                {process.name}
              </p>


            </div>
          </div>
        </TableCell>

        <TableCell className="text-right tabular-nums">
          {Number.isFinite(process.cpu) ? `${process.cpu.toFixed(1)}%` : "—"}
        </TableCell>

        <TableCell className="text-right tabular-nums">
          {typeof process.gpu === "number" && Number.isFinite(process.gpu)
            ? `${process.gpu.toFixed(1)}%`
            : <span className="text-muted-foreground">—</span>}
        </TableCell>

        <TableCell className="text-right tabular-nums">
          {Number.isFinite(process.memory)
            ? `${process.memory.toFixed(1)} MB`
            : "—"}
        </TableCell>

        <TableCell className="text-right tabular-nums">
          {typeof process.disk === "number" && Number.isFinite(process.disk)
            ? formatDiskActivity(process.disk)
            : <span className="text-muted-foreground">—</span>}
        </TableCell>

        <TableCell>
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            process.status === "Running"
                ? "bg-green-500/10 text-green-600"
                : process.status === "Suspended"
                ? "bg-yellow-500/10 text-yellow-600"
                : "bg-red-500/10 text-red-600"
            }`}
        >
            <span
            className={`h-2 w-2 rounded-full ${
                process.status === "Running"
                ? "bg-green-500"
                : process.status === "Suspended"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            />
            {process.status ?? "Unknown"}
        </span>
        </TableCell>
      </TableRow>

      {selected && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/20 p-4">
            <ProcessActions
            pid={process.pid}
            executablePath={process.executablePath}
            isCritical={process.isCritical}
            onEndProcess={onEndProcess}
            />
          </TableCell>
        </TableRow>
        
      )}

    </>
  );
}
