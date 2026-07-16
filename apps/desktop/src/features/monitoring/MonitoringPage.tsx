import { Activity } from "lucide-react";

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monitoring</h1>

        <p className="text-muted-foreground">
          Real-time system monitoring
        </p>
      </div>

      <div className="rounded-xl border p-8">
        <Activity className="mb-4 h-10 w-10" />

        <h2 className="text-xl font-semibold">
          Live Monitoring
        </h2>

        <p className="text-muted-foreground">
          This page will display detailed CPU, Memory, GPU,
          Storage and Network information.
        </p>
      </div>
    </div>
  );
}