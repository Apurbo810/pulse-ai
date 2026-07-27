//features/processes/components/actions/ProcessActions.tsx


import {
  Ban,
  FolderOpen,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface ProcessActionsProps {
  pid: number;
  executablePath: string | null;
  isCritical: boolean;

  onEndProcess: (pid: number) => Promise<void>;
}

export default function ProcessActions({
  pid,
  executablePath,
  isCritical,
  onEndProcess,
}: ProcessActionsProps) {
  async function handleEndTask() {
  try {
    await onEndProcess(pid);
  } catch (error) {
    console.error("Failed to end process:", error);
  }
}
  return (
    <div className="rounded-lg border bg-background p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold">
          Process Details
        </h3>

        <div className="mt-2 rounded-md bg-muted p-3">
          <p className="break-all text-xs text-muted-foreground">
            {executablePath ?? "Executable path unavailable."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={!executablePath}
          onClick={() => {
            if (executablePath) {
              window.system.openFileLocation(executablePath);
            }
          }}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Open File Location
        </Button>

        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze with AI
        </Button>

        <Button
          variant="destructive"
          className="ml-auto"
          disabled={isCritical}
          onClick={handleEndTask}
        >
          <Ban className="mr-2 h-4 w-4" />
          {isCritical ? "Protected Process" : "End Task"}
        </Button>
      </div>
    </div>
  );
}