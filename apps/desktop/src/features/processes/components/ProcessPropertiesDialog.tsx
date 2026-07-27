//features/processes/components/ProcessPropertiesDialog.tsx


import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ProcessInfo } from "@/types/system";

import ProcessOverview from "./ProcessOverview";
import ProcessMetrics from "./ProcessMetrics";
import ProcessPath from "./ProcessPath";

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
      onOpenChange={(value: boolean) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Process Properties</DialogTitle>
        </DialogHeader>

        {/* General Information */}
        <ProcessOverview process={process} />

        {/* Performance */}
        <ProcessMetrics process={process} />

        {/* Executable */}
        <ProcessPath process={process} />

        {/* Actions */}
        <DialogFooter className="justify-between">
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