import { Monitor } from "lucide-react";

import type { DisplayInfo } from "@/types/system";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DisplayCardProps {
  displays: DisplayInfo[];
}

export default function DisplayCard({ displays }: DisplayCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Display</CardTitle>
        <Monitor className="h-5 w-5" />
      </CardHeader>

      <CardContent className="space-y-4">
        {displays.map((display, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between">
              <span>Model</span>
              <span>{display.model || "Unknown"}</span>
            </div>

            <div className="flex justify-between">
              <span>Vendor</span>
              <span>{display.vendor || "Unknown"}</span>
            </div>

            <div className="flex justify-between">
              <span>Resolution</span>
              <span>{display.resolution}</span>
            </div>

            <div className="flex justify-between">
              <span>Refresh Rate</span>
              <span>{display.refreshRate} Hz</span>
            </div>

            <div className="flex justify-between">
              <span>Primary</span>
              <span>{display.main ? "Yes" : "No"}</span>
            </div>

            {index < displays.length - 1 && (
              <hr className="border-border" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}