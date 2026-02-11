/**
 * Format a number as a percentage string (e.g., "94.2%")
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a file size in GB (e.g., "4.32 GB")
 */
export function formatFileSize(gb: number): string {
  return `${gb.toFixed(2)} GB`;
}

/**
 * Format a speed value (e.g., "45.3 tok/s")
 */
export function formatSpeed(toksPerSec: number): string {
  return `${toksPerSec.toFixed(1)} tok/s`;
}

/**
 * Format VRAM usage (e.g., "6.8 GB")
 */
export function formatVram(gb: number): string {
  return `${gb.toFixed(1)} GB`;
}

/**
 * Format a generic number with specified decimal places
 */
export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

/**
 * Create a URL-safe slug from a model name
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
