// features/processes/components/ProcessPath.tsx

import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ProcessInfo } from "@/types/system";

interface ProcessPathProps {
  process: ProcessInfo;
}

export default function ProcessPath({
  process,
}: ProcessPathProps) {
  return (
    <div className="rounded-lg border bg-background p-5">
      <h3 className="mb-3 text-sm font-semibold">
        Executable
      </h3>

      <div className="rounded-md bg-muted p-3">
        <p className="break-all text-xs text-muted-foreground">
          {process.executablePath ??
            "Executable path unavailable."}
        </p>
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          disabled={!process.executablePath}
          onClick={() => {
            if (process.executablePath) {
              window.system.openFileLocation(
                process.executablePath
              );
            }
          }}
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Open File Location
        </Button>
      </div>
    </div>
  );
}