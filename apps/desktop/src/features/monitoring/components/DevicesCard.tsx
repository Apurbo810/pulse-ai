import { Keyboard, Mouse } from "lucide-react";

import type { DevicesInfo } from "@/types/system";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DevicesCardProps {
  devices: DevicesInfo;
}

export default function DevicesCard({ devices }: DevicesCardProps) {
  const hasDevices =
    devices.keyboards.length > 0 || devices.mice.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {!hasDevices ? (
          <p className="text-sm text-muted-foreground">
            No devices detected.
          </p>
        ) : (
          <>
            {/* Keyboards */}
            {devices.keyboards.map((keyboard, index) => (
              <div
                key={`keyboard-${index}`}
                className="flex items-center justify-between border-b pb-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Keyboard className="h-5 w-5" />

                  <div>
                    <p className="font-medium">{keyboard.name}</p>

                    <p className="text-sm text-muted-foreground">
                      {keyboard.manufacturer}
                    </p>
                  </div>
                </div>

                <span className="text-sm text-muted-foreground">
                  Keyboard
                </span>
              </div>
            ))}

            {/* Mice */}
            {devices.mice.map((mouse, index) => (
              <div
                key={`mouse-${index}`}
                className="flex items-center justify-between border-b pb-3 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Mouse className="h-5 w-5" />

                  <div>
                    <p className="font-medium">{mouse.name}</p>

                    <p className="text-sm text-muted-foreground">
                      {mouse.manufacturer}
                    </p>
                  </div>
                </div>

                <span className="text-sm text-muted-foreground">
                  Mouse
                </span>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}