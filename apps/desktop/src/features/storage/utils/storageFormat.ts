/**
 * Converts bytes to a human-readable string.
 * Example:
 * 256000000000 -> 238.4 GB
 * 1500000000000 -> 1.36 TB
 */
  export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
  }
/**
 * Converts usage to a percentage string.
 * Example:
 * 63.245 -> 63%
 */
export function formatUsage(usage: number): string {
  return `${Math.round(usage)}%`;
}

/**
 * Returns a friendly drive type.
 * Example:
 * SSD
 * HDD
 * NVMe
 */
export function formatDriveType(type: string): string {
  return type.toUpperCase();
}