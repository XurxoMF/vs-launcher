/** Compares two version strings numerically. Returns negative if a < b, positive if a > b, 0 if equal. Pre-release suffixes are ignored. */
export function compareVersions(a: string, b: string): number {
  const parts = (v: string): number[] => v.split("-")[0].split(".").map(Number)
  const ap = parts(a)
  const bp = parts(b)
  for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
    const diff = (ap[i] ?? 0) - (bp[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}
