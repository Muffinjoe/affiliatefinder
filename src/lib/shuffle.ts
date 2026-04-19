/**
 * Deterministic shuffle from a numeric seed (LCG).
 * Same seed → same order across renders (no hydration mismatch).
 */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = (seed >>> 0) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Time-bucketed seed. Page revalidate is 60s, so the default bucket matches —
 * a fresh ordering every revalidation pass.
 */
export function rotationSeed(intervalMs = 60_000): number {
  return Math.floor(Date.now() / intervalMs);
}
