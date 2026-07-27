// features/processes/components/ProcessTable.tsx

import { useState } from "react";

import type { ProcessInfo } from "@/types/system";
import type { SortDirection, SortField } from "../types";

import ProcessRow from "./ProcessRow";
import ProcessContextMenu from "./ProcessContextMenu";
import SortableHeader from "./SortableHeader";
import ProcessPropertiesDialog from "./ProcessPropertiesDialog";

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

  onEndProcess: (pid: number) => Promise<void>;
}

export default function ProcessTable({
  processes,
  loading,
  sortField,
  sortDirection,
  onSort,
  onEndProcess,
}: ProcessTableProps) {
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [selectedProcess, setSelectedProcess] =useState<ProcessInfo | null>(null);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    process: null as ProcessInfo | null,
  });

  function openContextMenu(
    x: number,
    y: number,
    process: ProcessInfo
  ) {
    setContextMenu({
      open: true,
      x,
      y,
      process,
    });
  }

  function closeContextMenu() {
    setContextMenu((prev) => ({
      ...prev,
      open: false,
      process: null,
    }));
  }
  function openProperties(process: ProcessInfo) {
  setSelectedProcess(process);
    setPropertiesOpen(true);
  }
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
    <>
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
                onEndProcess={onEndProcess}
                onOpenContextMenu={openContextMenu}
              />
            ))}
          </TableBody>
        </Table>
      </div>

    <ProcessContextMenu
      open={contextMenu.open}
      x={contextMenu.x}
      y={contextMenu.y}
      process={contextMenu.process}
      onClose={closeContextMenu}
      onEndProcess={onEndProcess}
      onOpenProperties={openProperties}
    />
    <ProcessPropertiesDialog
      open={propertiesOpen}
      process={selectedProcess}
      onClose={() => setPropertiesOpen(false)}
      onEndProcess={onEndProcess}
    />
    </>
  );
}