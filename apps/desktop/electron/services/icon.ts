import { app } from "electron";

const iconCache = new Map<string, string>();

export async function getFileIcon(
  executablePath: string
): Promise<string | null> {
  if (!executablePath) {
    return null;
  }

  // Return cached icon if we've already extracted it
  const cached = iconCache.get(executablePath);

  if (cached) {
    return cached;
  }

  try {
    const icon = await app.getFileIcon(executablePath, {
      size: "normal",
    });

    if (icon.isEmpty()) {
      return null;
    }

    const png = icon.toPNG();

    const dataUrl = `data:image/png;base64,${png.toString("base64")}`;

    iconCache.set(executablePath, dataUrl);

    return dataUrl;
  } catch (error) {
    console.error(
      `Failed to extract icon for: ${executablePath}`,
      error
    );

    return null;
  }
}