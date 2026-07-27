//features/processes/components/dialogs/ProcessPropertiesDialog.tsx


import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ProcessInfo } from "@/types/system";

import OverviewSection from "./sections/OverviewSection";
import PerformanceSection from "./sections/PerformanceSection";
import ProcessDetailsSection from "./sections/ProcessDetailsSection";
import ExecutableSection from "./sections/ExecutableSection";
import ProcessAdvancedSection from "./sections/ProcessAdvancedSection";

interface ProcessPropertiesDialogProps {
  open: boolean;
  process: ProcessInfo | null;

  onClose(): void;
  onEndProcess(pid: number): Promise<void>;
}

export default function ProcessPropertiesDialog({
  open,
  process,
  onClose,
  onEndProcess,
}: ProcessPropertiesDialogProps) {
if (!process) return null;

const currentProcess = process;
  async function handleEndTask() {
    await onEndProcess(currentProcess.pid);
    onClose();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="w-900px max-w-95vw space-y-4">
        <DialogHeader>
          <DialogTitle>Process Properties</DialogTitle>
        </DialogHeader>

        {/* Overview */}
        <OverviewSection process={process} />

        {/* Performance + Details */}
        <div className="grid gap-4 lg:grid-cols-2">
          <PerformanceSection process={process} />
          <ProcessDetailsSection process={process} />
        </div>

        {/* Executable + Advanced */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ExecutableSection process={process} />
          <ProcessAdvancedSection process={process} />
        </div>

        <DialogFooter className="flex-row justify-between gap-3">
          <button
            disabled={process.isCritical}
            onClick={handleEndTask}
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {process.isCritical ? "Protected Process" : "End Task"}
          </button>

          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2 transition-colors hover:bg-muted"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}