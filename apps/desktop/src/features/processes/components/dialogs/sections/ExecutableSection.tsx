import { FolderOpen, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ProcessInfo } from "@/types/system";

interface ExecutableSectionProps {
  process: ProcessInfo;
}

function getFileName(path?: string | null) {
  if (!path) return "Executable unavailable";

  const parts = path.split("\\");

  return parts[parts.length - 1];
}

export default function ExecutableSection({
  process,
}: ExecutableSectionProps) {
  return (
    <div className="rounded-lg border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold">
        Executable
      </h3>

      <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-3">
        <FileText className="h-5 w-5 text-muted-foreground" />

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium"
            title={process.executablePath ?? ""}
          >
            {getFileName(process.executablePath)}
          </p>

          <p className="text-xs text-muted-foreground">
            Executable File
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        className="mt-4 w-full"
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
  );
}