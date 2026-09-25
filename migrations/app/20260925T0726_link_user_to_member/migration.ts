#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2756326ed411faced89e1ff142dc8813a68eb6e26b0ae0cff68d5731ee880a13/contract';
import endContract from '../../snapshots/2756326ed411faced89e1ff142dc8813a68eb6e26b0ae0cff68d5731ee880a13/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/b6cc5fd3fb5db1ed34620543910d76b00c9221b05f2a7654154bb86c0bc0cc62/contract';
import startContract from '../../snapshots/b6cc5fd3fb5db1ed34620543910d76b00c9221b05f2a7654154bb86c0bc0cc62/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'PostCategory',
        members: ['NEWS', 'ACHIEVEMENT', 'ANNOUNCEMENT', 'TOURNAMENT'],
      }),
      this.createTable({
        schema: 'public',
        table: 'Post',
        columns: [
          col('authorId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('category', '"PostCategory"', {
            notNull: true,
            default: lit('NEWS'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'PostCategory' } },
          }),
          col('clanId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('imageUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('publishedAt', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'Member',
        column: col('approvedById', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('isLead', 'bool', {
          notNull: true,
          default: fn('false'),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'User',
        column: col('memberId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_memberId_key',
        columns: ['memberId'],
        extras: { unique: true },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Member',
        foreignKey: {
          name: 'Member_approvedById_fkey',
          columns: ['approvedById'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Post',
        foreignKey: {
          name: 'Post_clanId_fkey',
          columns: ['clanId'],
          references: { schema: 'public', table: 'Clan', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Post',
        foreignKey: {
          name: 'Post_authorId_fkey',
          columns: ['authorId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'User',
        foreignKey: {
          name: 'User_memberId_fkey',
          columns: ['memberId'],
          references: { schema: 'public', table: 'Member', columns: ['id'] },
          onDelete: 'setNull',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
