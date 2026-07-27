import { Copy, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ProcessInfo } from "@/types/system";

interface ProcessAdvancedSectionProps {
  process: ProcessInfo;
}

export default function ProcessAdvancedSection({
  process,
}: ProcessAdvancedSectionProps) {
  async function copyCommandLine() {
    if (!process.commandLine) return;

    await navigator.clipboard.writeText(process.commandLine);
  }

  return (
    <div className="rounded-lg border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold">
        Advanced
      </h3>

      <div className="flex items-start gap-3 rounded-lg border bg-muted/40 px-3 py-3">
        <Terminal className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">
            Command Line
          </p>

          <p
            className="mt-1 truncate font-mono text-xs"
            title={process.commandLine ?? ""}
          >
            {process.commandLine ?? "Unavailable"}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        className="mt-4 w-full"
        disabled={!process.commandLine}
        onClick={copyCommandLine}
      >
        <Copy className="mr-2 h-4 w-4" />
        Copy Command Line
      </Button>
    </div>
  );
}