#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/879f4f666a567bf15a6803921f781ccaccecdb84f59cd608eeedfd5446f20c13/contract';
import endContract from '../../snapshots/879f4f666a567bf15a6803921f781ccaccecdb84f59cd608eeedfd5446f20c13/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/905b22516267fa22fa951888e9c5dc7e769b63c4f872a1e5d36022f21d8bc7a3/contract';
import startContract from '../../snapshots/905b22516267fa22fa951888e9c5dc7e769b63c4f872a1e5d36022f21d8bc7a3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Member',
        column: col('codmClass', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
