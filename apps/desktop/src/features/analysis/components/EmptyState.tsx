import { ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <ShieldCheck className="mb-4 size-14 text-green-500" />

        <h2 className="text-xl font-semibold">
          No Issues Detected
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Pulse AI did not detect any performance or security concerns
          based on the current system analysis.
        </p>
      </CardContent>
    </Card>
  );
}