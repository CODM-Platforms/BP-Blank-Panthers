import 'dotenv/config';
// Postgres Date/Timestamp columns read and write `Temporal` values, which
// Node.js doesn't ship globally until 26.8.2+. Polyfill it before the first
// query - without this, every create/update touching createdAt/updatedAt
// throws RUNTIME.TEMPORAL_UNAVAILABLE. Assigned manually (rather than via
// the package's own `temporal-polyfill/full/global` side-effect import)
// because that entry point's async ESM shape breaks Next.js's webpack build.
import { Temporal } from 'temporal-polyfill';
if (!('Temporal' in globalThis)) {
  (globalThis as unknown as { Temporal: typeof Temporal }).Temporal = Temporal;
}
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

// @ts-expect-error - this Prisma 8 rc build's `prisma7Schema` contract emitter
// omits `nullable` on to-one relation metadata, which trips the `Contract`
// generic constraint here even though the emitted contract is otherwise
// valid. Remove once upstream fixes CONTRACT.SOURCE relation emission
// (see prisma-8 skill references/contract.md - no current workaround).
export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
