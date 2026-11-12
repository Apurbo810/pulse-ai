// apps/desktop/src/features/analysis/AnalysisPage.tsx

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { SEVERITY_ORDER } from "@/features/processes/analysis/shared";
import type {
  AnalysisSeverity,
  ProcessAnalysis,
} from "@/features/processes/analysis/types";

import { useAnalysis } from "./hooks/useAnalysis";
import { useInsights } from "./hooks/useInsights";
import type { Insight } from "./insights/types";

import AnalysisCard from "./components/AnalysisCard";
import EmptyState from "./components/EmptyState";
import HealthScoreCard from "./components/HealthScoreCard";
import PriorityList from "./components/PriorityList";
import InsightPanel from "./components/InsightPanel";
import SeverityBadge from "./SeverityBadge";

type SortKey = "severity" | "name" | "time";

export default function AnalysisPage() {
  const { analyses, loading, lastUpdated, refresh } = useAnalysis(3000);
  const { insights, health, byId } = useInsights(analyses);

  const [severity, setSeverity] = useState<AnalysisSeverity | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("severity");
  const [grouped, setGrouped] = useState(true);

  // Snapshot of the insight at the moment it was opened, so the dialog does
  // not change or vanish while you are reading it.
  const [selected, setSelected] = useState<Insight | null>(null);

  function handleSelect(analysis: ProcessAnalysis) {
    setSelected(byId.get(analysis.id) ?? null);
  }

  const counts = useMemo(() => {
    const result: Record<AnalysisSeverity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    analyses.forEach((a) => {
      result[a.severity] += 1;
    });
    return result;
  }, [analyses]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = analyses.filter(
      (a) =>
        (severity === "all" || a.severity === severity) &&
        (!q ||
          [a.process.name, a.title, a.reason, String(a.process.pid)].some(
            (text) => text.toLowerCase().includes(q)
          ))
    );

    if (sort === "name") {
      list.sort((a, b) => a.process.name.localeCompare(b.process.name));
    }
    if (sort === "time") {
      list.sort((a, b) => a.detectedAt - b.detectedAt);
    }

    return list; // "severity" keeps the engine's order
  }, [analyses, severity, query, sort]);

  if (loading) {
    return (
      <p className="p-6 text-muted-foreground">Collecting samples…</p>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Analysis</h1>
          <p className="text-muted-foreground">
            {lastUpdated
              ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}`
              : "Performance and security issues detected by Pulse AI."}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => void refresh()}>
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Health score and priority list */}
      <div className="grid gap-4 lg:grid-cols-3">
        <HealthScoreCard health={health} />
        <PriorityList insights={insights} onSelect={handleSelect} />
      </div>

      {/* Summary cards (click to filter) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SEVERITY_ORDER.map((s) => (
          <Card
            key={s}
            onClick={() => setSeverity(severity === s ? "all" : s)}
            className={`cursor-pointer transition ${
              severity === s ? "border-primary" : ""
            }`}
          >
            <CardContent className="flex items-center justify-between p-4">
              <SeverityBadge severity={s} />
              <span className="text-2xl font-bold">{counts[s]}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search process, PID or issue…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="rounded-md border bg-background px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="severity">Sort: Severity</option>
          <option value="name">Sort: Process name</option>
          <option value="time">Sort: Longest running issue</option>
        </select>

        <Button
          variant={grouped ? "default" : "outline"}
          size="sm"
          onClick={() => setGrouped(!grouped)}
        >
          Group by severity
        </Button>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <EmptyState />
      ) : grouped && sort === "severity" ? (
        SEVERITY_ORDER.map((s) => {
          const items = visible.filter((a) => a.severity === s);
          if (items.length === 0) return null;

          return (
            <section key={s} className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <SeverityBadge severity={s} /> {items.length}
              </h2>
              {items.map((a) => (
                <AnalysisCard key={a.id} analysis={a} onSelect={handleSelect} />
              ))}
            </section>
          );
        })
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <AnalysisCard key={a.id} analysis={a} onSelect={handleSelect} />
          ))}
        </div>
      )}

      {/* Details dialog */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.analysis.title}</DialogTitle>
                <DialogDescription>{selected.analysis.reason}</DialogDescription>
              </DialogHeader>

              <InsightPanel key={selected.id} insight={selected} />

              <dl className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
                <dt className="text-muted-foreground">Process</dt>
                <dd>{selected.analysis.process.name}</dd>

                <dt className="text-muted-foreground">PID</dt>
                <dd>{selected.analysis.process.pid}</dd>

                <dt className="text-muted-foreground">Path</dt>
                <dd className="break-all">
                  {selected.analysis.process.executablePath ?? "—"}
                </dd>

                <dt className="text-muted-foreground">Owner</dt>
                <dd>{selected.analysis.process.owner ?? "—"}</dd>

                <dt className="text-muted-foreground">CPU</dt>
                <dd>{selected.analysis.process.cpu.toFixed(1)}%</dd>

                <dt className="text-muted-foreground">Memory</dt>
                <dd>{selected.analysis.process.memory.toFixed(0)} MB</dd>

                <dt className="text-muted-foreground">Detected</dt>
                <dd>{new Date(selected.analysis.detectedAt).toLocaleString()}</dd>
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}