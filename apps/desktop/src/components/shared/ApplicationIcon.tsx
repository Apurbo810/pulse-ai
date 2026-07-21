import { useEffect, useState } from "react";
import { AppWindow } from "lucide-react";

interface ApplicationIconProps {
  executablePath: string | null;
  size?: number;
  className?: string;
}

const iconCache = new Map<string, string | null>();

export default function ApplicationIcon({
  executablePath,
  size = 20,
  className = "",
}: ApplicationIconProps) {
  const [icon, setIcon] = useState<string | null>(null);

  useEffect(() => {
    if (!executablePath) {
      setIcon(null);
      return;
    }

    // Renderer-side cache
    const cached = iconCache.get(executablePath);

    if (cached !== undefined) {
      setIcon(cached);
      return;
    }

    let cancelled = false;

    const loadIcon = async () => {
      try {
        const result = await window.system.getFileIcon(executablePath);

        if (cancelled) return;

        iconCache.set(executablePath, result);
        setIcon(result);
      } catch (error) {
        console.error("Failed to load application icon:", error);

        if (cancelled) return;

        iconCache.set(executablePath, null);
        setIcon(null);
      }
    };

    loadIcon();

    return () => {
      cancelled = true;
    };
  }, [executablePath]);

  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className={`shrink-0 rounded-sm select-none ${className}`}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className={`flex shrink-0 items-center justify-center rounded-sm bg-muted ${className}`}
    >
      <AppWindow size={size * 0.75} className="text-muted-foreground" />
    </div>
  );
}