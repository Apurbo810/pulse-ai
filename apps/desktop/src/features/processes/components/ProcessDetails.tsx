import {
  Ban,
  Copy,
  FolderOpen,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface ProcessDetailsProps {
  executablePath: string | null;
}

export default function ProcessDetails({
  executablePath,
}: ProcessDetailsProps) {
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

        <Button variant="outline">
          <FolderOpen className="mr-2 h-4 w-4" />
          Open File Location
        </Button>

        <Button variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Copy Executable Path
        </Button>

        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze with AI
        </Button>

        <Button variant="destructive" className="ml-auto">
          <Ban className="mr-2 h-4 w-4" />
          End Task
        </Button>

      </div>
    </div>
  );
}