import type { ReactNode } from "react";
import type { StorageDevice } from "@/types/system";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import PartitionCard from "./PartitionCard";
interface StorageGroupCardProps {
  title: string;
  icon: ReactNode;
  drives: StorageDevice[];
}

export default function StorageGroupCard({
  title,
  icon,
  drives,
}: StorageGroupCardProps) {
  if (drives.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-3">
        {icon}

        <div>
          <CardTitle>{title}</CardTitle>

          <p className="text-sm text-muted-foreground">
            {drives.length} device{drives.length > 1 ? "s" : ""}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {drives.map((drive) => (
          <div
            key={drive.device}
            className="rounded-lg border p-4"
          >
        <div className="border-b pb-4">
        <h3 className="font-semibold text-lg">
            {drive.model}
        </h3>

        <p className="text-sm text-muted-foreground">
            {drive.interfaceType}
        </p>
        </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {drive.partitions.map((partition) => (
                <PartitionCard
                key={partition.letter}
                partition={partition}
                />
            ))}
            </div>

          </div>
        ))}
      </CardContent>
    </Card>
  );
}