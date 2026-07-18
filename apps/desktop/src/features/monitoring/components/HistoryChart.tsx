import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  value: {
    label: "Usage",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export interface HistoryChartProps {
  title: string;
  data: number[];
  unit?: string;
  color?: string;
}

export default function HistoryChart({
  title,
  data,
}: HistoryChartProps) {
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Waiting for monitoring data...
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="mb-2 text-sm font-medium">{title}</h4>

      <ChartContainer
        config={chartConfig}
        className="h-44 w-full"
      >
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="index"
            hide
          />

          <YAxis
            hide
            domain={[0, 100]}
          />

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent />}
          />
        <Line
        dataKey="value"
        type="linear"
        stroke="#2563eb"
        strokeWidth={2.5}
        dot={false}
        activeDot={{ r: 4 }}
        isAnimationActive={false}
        />
        </LineChart>
      </ChartContainer>
    </div>
  );
}