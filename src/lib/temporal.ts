/**
 * Prisma 8 returns Postgres timestamp columns as `Temporal` values (e.g.
 * `Temporal.PlainDateTime`), not JS `Date` objects. `new Date(temporalValue)`
 * throws (Temporal.valueOf() is forbidden by spec), and on Vercel's runtime
 * even `.toString()` throws too - something inside temporal-polyfill's own
 * formatting internals is broken there (TypeError: v[n] is not a function),
 * independent of native-vs-polyfill selection.
 *
 * Sidestep both by reading the plain numeric getters (year/month/day/...)
 * instead of calling any Temporal method at all - those are simple property
 * reads, not the calendar-aware formatting path that's crashing.
 */
export function toJsDate(value: unknown): Date {
  if (value instanceof Date) return value;

  if (
    value &&
    typeof value === 'object' &&
    'year' in value &&
    'month' in value &&
    'day' in value
  ) {
    const v = value as {
      year: number;
      month: number;
      day: number;
      hour?: number;
      minute?: number;
      second?: number;
      millisecond?: number;
    };
    return new Date(
      v.year,
      v.month - 1,
      v.day,
      v.hour ?? 0,
      v.minute ?? 0,
      v.second ?? 0,
      v.millisecond ?? 0
    );
  }

  return new Date(String(value));
}

function isTemporalLike(value: unknown): boolean {
  return (
    !!value &&
    typeof value === 'object' &&
    !(value instanceof Date) &&
    'year' in value &&
    'month' in value &&
    'day' in value
  );
}

/**
 * Recursively replaces any Temporal-like value in an object/array graph
 * with a plain JS Date. Required before passing any DB row (or anything
 * containing one) as a prop to a 'use client' component - React Server
 * Components serialize that crossing with JSON.stringify internally, which
 * calls the Temporal value's .toJSON(), hitting the exact same broken
 * internal path as .toString() (see toJsDate above). Passing a raw
 * Temporal value into a client component crashes the build even if no
 * page code ever reads that field.
 */
export function sanitizeForClient<T>(value: T): T {
  if (value == null) return value;
  if (value instanceof Date) return value;
  if (isTemporalLike(value)) return toJsDate(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => sanitizeForClient(v)) as unknown as T;
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeForClient(v);
    }
    return out as T;
  }
  return value;
}
