// features/processes/components/menus/ProcessContextMenu.tsx

import { useEffect } from "react";
import {
  Ban,
  FolderOpen,
  Info,
  Search,
} from "lucide-react";

import type { ProcessInfo } from "@/types/system";

interface ProcessContextMenuProps {
  open: boolean;

  x: number;
  y: number;

  process: ProcessInfo | null;

  onClose: () => void;

  onEndProcess: (pid: number) => Promise<void>;

    onOpenProperties(
        process: ProcessInfo
    ): void;
}

export default function ProcessContextMenu({
  open,
  x,
  y,
  process,
  onClose,
  onEndProcess,
  onOpenProperties,
}: ProcessContextMenuProps) {



  useEffect(() => {
    if (!open) return;

    const close = () => onClose();

    window.addEventListener("click", close);
    window.addEventListener("scroll", close);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open, onClose]);

  if (!open || !process) return null;   
  const currentProcess = process;

    async function handleEndTask() {
    await onEndProcess(currentProcess.pid);
    onClose();
    }

    function handleOpenFileLocation() {
    if (!currentProcess.executablePath) return;

    window.system.openFileLocation(currentProcess.executablePath);
    onClose();
    }
    function handleSearchOnline() {
    window.open(
        `https://www.google.com/search?q=${encodeURIComponent(currentProcess.name)}`,
        "_blank"
    );

    onClose();
    }

    function handleProperties() {
    onOpenProperties(currentProcess);
    onClose();
    }

  return (
    <div
      className="fixed inset-0 z-50"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="absolute w-64 rounded-lg border bg-card shadow-2xl"
        style={{
          left: x,
          top: y,
        }}
      >
    <button
    disabled={currentProcess.isCritical}
    onClick={handleEndTask}
    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
    <Ban
        className={`h-4 w-4 ${
        currentProcess.isCritical
            ? "text-muted-foreground"
            : "text-red-500"
        }`}
    />

    {currentProcess.isCritical
        ? "Protected Process"
        : "End Task"}
    </button>

        <div className="my-1 h-px bg-border" />

        <button
          disabled={!currentProcess.executablePath}
          onClick={handleOpenFileLocation}
          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FolderOpen className="h-4 w-4" />
          Open File Location
        </button>

        <button
          onClick={handleSearchOnline}
          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
        >
          <Search className="h-4 w-4" />
          Search Online
        </button>

        <div className="my-1 h-px bg-border" />

        <button
          onClick={handleProperties}
          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
        >
          <Info className="h-4 w-4" />
          Properties
        </button>
      </div>
    </div>
  );
}