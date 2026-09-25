#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/4ed56cdd12e86a41742c3476c0d9426d891d9485976da8c6d06eb8f73fa4e753/contract';
import endContract from '../../snapshots/4ed56cdd12e86a41742c3476c0d9426d891d9485976da8c6d06eb8f73fa4e753/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/8068f7ca293d976d213a9cd81ba8266e8d61ba13fbe753bb630f6c34c74541f5/contract';
import startContract from '../../snapshots/8068f7ca293d976d213a9cd81ba8266e8d61ba13fbe753bb630f6c34c74541f5/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'TournamentPhoto',
        columns: [
          col('caption', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('imageUrl', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tournamentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'TournamentPhoto',
        foreignKey: {
          name: 'TournamentPhoto_tournamentId_fkey',
          columns: ['tournamentId'],
          references: { schema: 'public', table: 'Tournament', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
