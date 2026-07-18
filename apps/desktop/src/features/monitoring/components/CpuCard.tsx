import { Cpu } from "lucide-react";

import type { CpuInfo } from "@/types/system";
import HistoryChart from "./HistoryChart";
import { useHistory } from "../hooks/useHistory";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CpuCardProps {
  cpu: CpuInfo;
}

export default function CpuCard({ cpu }: CpuCardProps) {

  const cpuHistory = useHistory(cpu.usage);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>CPU</CardTitle>
        <Cpu className="h-5 w-5" />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Usage</span>
          <span>{cpu.usage}%</span>
        </div>

        <div className="flex justify-between">
          <span>User</span>
          <span>{cpu.user}%</span>
        </div>

        <div className="flex justify-between">
          <span>System</span>
          <span>{cpu.system}%</span>
        </div>

        <div className="flex justify-between">
          <span>Idle</span>
          <span>{cpu.idle}%</span>
        </div>
      <HistoryChart
        title="CPU Usage"
        data={cpuHistory}
        unit="%"
      />
      </CardContent>

    </Card>
  );
}