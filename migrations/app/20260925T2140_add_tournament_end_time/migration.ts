#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/4ed56cdd12e86a41742c3476c0d9426d891d9485976da8c6d06eb8f73fa4e753/contract';
import startContract from '../../snapshots/4ed56cdd12e86a41742c3476c0d9426d891d9485976da8c6d06eb8f73fa4e753/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/905b22516267fa22fa951888e9c5dc7e769b63c4f872a1e5d36022f21d8bc7a3/contract';
import endContract from '../../snapshots/905b22516267fa22fa951888e9c5dc7e769b63c4f872a1e5d36022f21d8bc7a3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Tournament',
        column: col('tournamentEnd', 'timestamp(3)', {
          codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
