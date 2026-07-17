export function getUsageStatus(usage: number) {
  if (usage >= 90) {
    return {
      label: "Critical",
      color: "bg-red-500",
    };
  }

  if (usage >= 70) {
    return {
      label: "Warning",
      color: "bg-yellow-500",
    };
  }

  return {
    label: "Healthy",
    color: "bg-green-500",
  };
}