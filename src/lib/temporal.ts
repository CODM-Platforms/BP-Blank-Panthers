/**
 * Prisma 8 returns Postgres timestamp columns as `Temporal` values (e.g.
 * `Temporal.PlainDateTime`), not JS `Date` objects. Temporal deliberately
 * blocks the implicit coercion `new Date(temporalValue)` relies on
 * (`valueOf()` throws by spec) - convert explicitly via `.toString()`
 * first, which Temporal does support.
 */
export function toJsDate(value: unknown): Date {
  return new Date(String(value));
}
