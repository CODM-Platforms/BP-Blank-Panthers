import 'dotenv/config';
// Postgres Date/Timestamp columns read and write `Temporal` values, which
// Node.js doesn't ship globally until 26.8.2+. Polyfill it before the first
// query - without this, every create/update/read touching a timestamp
// column throws RUNTIME.TEMPORAL_UNAVAILABLE.
//
// Previously used `temporal-polyfill`, but its Temporal.PlainDateTime
// .toString()/.toJSON() crash on Vercel's runtime specifically (TypeError:
// v[n] is not a function) - both when *we* format a date and, worse, when
// the ORM itself auto-encodes updatedAt/createdAt for every write, which
// broke every create/update in production. temporal-polyfill is also pure
// ESM with no CJS build, which forced an awkward dynamic-import workaround
// just to load it into Next's CJS server bundle.
//
// @js-temporal/polyfill is a different implementation (from the TC39/
// Igalia reference polyfill lineage) that ships a real CJS build, so it
// loads with a plain static import - and its toString()/toJSON() don't hit
// whatever internal gap in temporal-polyfill was breaking on Vercel.
import { Temporal } from '@js-temporal/polyfill';
(globalThis as unknown as { Temporal: typeof Temporal }).Temporal = Temporal;

import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
