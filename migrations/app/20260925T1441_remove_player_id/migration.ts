#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8068f7ca293d976d213a9cd81ba8266e8d61ba13fbe753bb630f6c34c74541f5/contract';
import endContract from '../../snapshots/8068f7ca293d976d213a9cd81ba8266e8d61ba13fbe753bb630f6c34c74541f5/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/88278bf13a339a3d736466447deae33fc5dfc4866fd95e4eb11245fba30937fa/contract';
import startContract from '../../snapshots/88278bf13a339a3d736466447deae33fc5dfc4866fd95e4eb11245fba30937fa/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropIndex({ schema: 'public', table: 'Member', index: 'Member_playerId_key' }),
      this.dropColumn({ schema: 'public', table: 'Member', column: 'playerId' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
