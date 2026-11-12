// apps/desktop/src/features/analysis/components/InsightPanel.tsx

import { useState } from "react";
import { Ban, FolderOpen, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { ActionKind, Insight, RecommendationType } from "../insights/types";

const typeLabels: Record<RecommendationType, string> = {
  performance: "Performance",
  security: "Security",
  gaming: "Gaming",
};

const typeVariants: Record<
  RecommendationType,
  "secondary" | "destructive" | "outline"
> = {
  performance: "secondary",
  security: "destructive",
  gaming: "outline",
};

export default function InsightPanel({ insight }: { insight: Insight }) {
  const { analysis, explanation, recommendations, actions } = insight;

  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAction(kind: ActionKind) {
    const { executablePath, pid } = analysis.process;

    if (kind === "openLocation") {
      if (executablePath) await window.system.openFileLocation(executablePath);
      return;
    }

    // End Task needs a second click to confirm
    if (!confirming) {
      setConfirming(true);
      return;
    }

    try {
      await window.system.endProcess(pid);
      setMessage("Task ended.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not end the task."
      );
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div className="space-y-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          What this means
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {explanation}
        </p>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">What you can do</h3>
          <ul className="space-y-2">
            {recommendations.map((r, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Badge variant={typeVariants[r.type]} className="mt-0.5">
                  {typeLabels[r.type]}
                </Badge>
                <span className="flex-1 text-muted-foreground">{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) =>
            action.kind === "openLocation" ? (
              <Button
                key={action.kind}
                variant="outline"
                size="sm"
                onClick={() => void handleAction(action.kind)}
              >
                <FolderOpen className="mr-2 size-4" />
                {action.label}
              </Button>
            ) : (
              <Button
                key={action.kind}
                variant="destructive"
                size="sm"
                className="ml-auto"
                onClick={() => void handleAction(action.kind)}
              >
                <Ban className="mr-2 size-4" />
                {confirming ? "Click again to confirm" : action.label}
              </Button>
            )
          )}
        </div>
      )}

      {analysis.process.isCritical && (
        <p className="text-xs text-muted-foreground">
          This is a protected Windows process, so it cannot be ended.
        </p>
      )}

      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}