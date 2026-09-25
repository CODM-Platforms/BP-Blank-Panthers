import 'dotenv/config';
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
