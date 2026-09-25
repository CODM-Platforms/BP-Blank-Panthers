import 'dotenv/config';
// Postgres Date/Timestamp columns read and write `Temporal` values, which
// Node.js doesn't ship globally until 26.8.2+. Polyfill it before the first
// query - without this, every create/update/read touching a timestamp
// column throws RUNTIME.TEMPORAL_UNAVAILABLE.
//
// temporal-polyfill is pure ESM with no CJS build at all, which Next's
// webpack can't statically import into the CJS server bundle it needs for
// the Node.js runtime (top-level-await syntax error) - and can't require()
// at runtime either (ERR_REQUIRE_ESM) if externalized instead. A genuine
// dynamic import() is the one shape both webpack and Node handle correctly
// for an ESM-only package from a CJS context. Not awaited here (top-level
// await hits the same webpack limitation) - resolving a local, already-
// installed module is near-instant, always well ahead of any actual network
// round trip to the database, so every real query is safe by the time it
// needs to decode/encode a timestamp.
//
// Importing from 'temporal-polyfill/implementation' (not the plain
// 'temporal-polyfill' entry) forces the polyfill's own implementation
// instead of auto-detecting a "native" Temporal - Vercel's runtime exposes
// something that gets detected as native but crashes inside
// PlainDateTime.toString(), so this always overwrites globalThis.Temporal
// unconditionally rather than skipping when something's already there.
import('temporal-polyfill/implementation').then(({ Temporal }) => {
  (globalThis as unknown as { Temporal: typeof Temporal }).Temporal = Temporal;
});
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
