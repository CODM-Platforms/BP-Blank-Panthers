#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/68ce4f1ffe82d8a964a3fc5ffb88fb7330594d894e4a74f5530eba3cc7f6fd2c/contract';
import endContract from '../../snapshots/68ce4f1ffe82d8a964a3fc5ffb88fb7330594d894e4a74f5530eba3cc7f6fd2c/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/879f4f666a567bf15a6803921f781ccaccecdb84f59cd608eeedfd5446f20c13/contract';
import startContract from '../../snapshots/879f4f666a567bf15a6803921f781ccaccecdb84f59cd608eeedfd5446f20c13/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Participant',
        column: col('kills', 'int4', { default: fn('0'), codecRef: { codecId: 'pg/int4@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
