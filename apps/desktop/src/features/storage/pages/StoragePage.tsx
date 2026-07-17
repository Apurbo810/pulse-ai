import StorageOverview from "../components/StorageOverview";
import StorageGroupCard from "../components/StorageGroupCard";
import { useStorage } from "../hooks/useStorage";
import { HardDrive, Usb, Disc3 } from "lucide-react";
export default function StoragePage() {
    
    const { summary, devices, loading, error } = useStorage();

console.table(devices);
    const ssdDrives = devices.filter(
    (drive) => drive.type.toUpperCase() === "SSD"
    );

    const hddDrives = devices.filter(
    (drive) => drive.type.toUpperCase() === "HD"
    );

    const usbDrives = devices.filter(
    (drive) =>
        drive.interfaceType.toUpperCase().includes("USB")
    );

    const cdDrives = devices.filter(
    (drive) =>
        drive.type.toUpperCase().includes("CD") ||
        drive.type.toUpperCase().includes("DVD")
    );
  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Storage</h1>
        <p>Loading storage information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Storage</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Storage</h1>

        <p className="text-muted-foreground">
          View and manage your storage devices.
        </p>
      </div>

      <StorageOverview summary={summary} />
      <div className="space-y-6">

        <StorageGroupCard
            title="SSD"
            icon={<HardDrive className="h-5 w-5" />}
            drives={ssdDrives}
        />

        <StorageGroupCard
            title="HDD"
            icon={<HardDrive className="h-5 w-5" />}
            drives={hddDrives}
        />

        <StorageGroupCard
            title="USB Storage"
            icon={<Usb className="h-5 w-5" />}
            drives={usbDrives}
        />

        <StorageGroupCard
            title="CD / DVD"
            icon={<Disc3 className="h-5 w-5" />}
            drives={cdDrives}
        />

    </div>
    </div>
  );
}