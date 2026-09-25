#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2756326ed411faced89e1ff142dc8813a68eb6e26b0ae0cff68d5731ee880a13/contract';
import startContract from '../../snapshots/2756326ed411faced89e1ff142dc8813a68eb6e26b0ae0cff68d5731ee880a13/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/88278bf13a339a3d736466447deae33fc5dfc4866fd95e4eb11245fba30937fa/contract';
import endContract from '../../snapshots/88278bf13a339a3d736466447deae33fc5dfc4866fd95e4eb11245fba30937fa/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'Clan',
        column: col('whatsappGroupLink', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
