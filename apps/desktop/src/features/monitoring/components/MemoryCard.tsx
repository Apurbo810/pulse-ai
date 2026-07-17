import { MemoryStick } from "lucide-react";

import type { MemoryInfo } from "@/types/system";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MemoryCardProps {
  memory: MemoryInfo;
}

function formatGB(bytes: number) {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Memory</CardTitle>
        <MemoryStick className="h-5 w-5" />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Total</span>
          <span>{formatGB(memory.total)} GB</span>
        </div>

        <div className="flex justify-between">
          <span>Used</span>
          <span>{formatGB(memory.used)} GB</span>
        </div>

        <div className="flex justify-between">
          <span>Free</span>
          <span>{formatGB(memory.free)} GB</span>
        </div>
      </CardContent>
    </Card>
  );
}