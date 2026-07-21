import type { ProcessInfo } from "@/types/system";
import { useState } from "react";
import ProcessRow from "./ProcessRow";
import type { SortDirection, SortField } from "../types";
import SortableHeader from "./SortableHeader";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProcessTableProps {
  processes: ProcessInfo[];
  loading: boolean;

  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

  export default function ProcessTable({
    processes,
    loading,
    sortField,
    sortDirection,
    onSort,
  }: ProcessTableProps) {
 const [selectedPid, setSelectedPid] = useState<number | null>(null);
    
    if (loading) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        Loading processes...
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">
        No running processes found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
     <TableHeader>
  <TableRow className="bg-muted/30 hover:bg-muted/30">
    <TableHead className="w-[40%]">
      <SortableHeader
        label="Application"
        field="name"
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
      />
    </TableHead>

    <TableHead className="w-[12%] text-right">
      <SortableHeader
        label="CPU"
        field="cpu"
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={onSort}
        className="justify-end w-full"
      />
    </TableHead>

        <TableHead className="w-[12%] text-right">
          <SortableHeader
            label="GPU"
            field="gpu"
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            className="justify-end w-full"
          />
        </TableHead>

        <TableHead className="w-[14%] text-right">
          <SortableHeader
            label="Memory"
            field="memory"
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            className="justify-end w-full"
          />
        </TableHead>

        <TableHead className="w-[12%] text-right">
          <SortableHeader
            label="Disk"
            field="disk"
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            className="justify-end w-full"
          />
        </TableHead>

        <TableHead className="w-[10%] font-semibold">
          Status
        </TableHead>
      </TableRow>
    </TableHeader>

        <TableBody>
          {processes.map((process) => (
            <ProcessRow
              key={process.pid}
              process={process}
              selected={selectedPid === process.pid}
              onSelect={() =>
                setSelectedPid((prev) =>
                  prev === process.pid ? null : process.pid
                )
              }
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}