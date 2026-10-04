type Options = {limit: number; windowMs: number; now?: () => number};

/** Best-effort, per-instance sliding-window limiter (fine for a low-traffic contact form). */
export function createRateLimiter({limit, windowMs, now = Date.now}: Options) {
  const hits = new Map<string, number[]>();
  return {
    check(key: string): boolean {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      if (hits.size > 5000) {
        for (const [k, v] of hits) if (v.every((at) => t - at >= windowMs)) hits.delete(k);
      }
      return true;
    },
  };
}
