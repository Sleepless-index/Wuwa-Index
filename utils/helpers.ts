/**
 * Converts a resonator name to the safe filename slug used for images.
 * e.g. "Xiangli Yao" → "Xiangli_Yao"
 */
export function toImageSlug(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
