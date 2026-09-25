#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/b6cc5fd3fb5db1ed34620543910d76b00c9221b05f2a7654154bb86c0bc0cc62/contract';
import endContract from '../../snapshots/b6cc5fd3fb5db1ed34620543910d76b00c9221b05f2a7654154bb86c0bc0cc62/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'AttendanceStatus',
        members: ['PENDING', 'CONFIRMED', 'DECLINED', 'ATTENDED', 'NO_SHOW'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'GameMode',
        members: ['BR', 'MP', 'CUSTOM'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'MemberStatus',
        members: ['PENDING', 'APPROVED', 'ACTIVE', 'WARNING', 'SUSPENDED', 'INACTIVE', 'REMOVED'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'Role',
        members: ['SUPER_ADMIN', 'CLAN_MASTER', 'TOURNAMENT_MANAGER', 'MODERATOR'],
      }),
      this.createNativeEnumType({
        schema: 'public',
        typeName: 'TournamentStatus',
        members: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      }),
      this.createTable({
        schema: 'public',
        table: 'AuditLog',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('details', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Clan',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('logo', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tag', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Member',
        columns: [
          col('adminNotes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('clanId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('codmUid', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('codmUsername', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('country', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('deviceModel', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('deviceSerial', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('fullName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('playerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('preferredMode', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('profilePicture', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('region', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', '"MemberStatus"', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'MemberStatus' } },
          }),
          col('suspensionEnd', 'timestamp(3)', {
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('tournamentsAttended', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tournamentsConfirmed', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tournamentsDeclined', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tournamentsInvited', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tournamentsMissed', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('whatsappNumber', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Participant',
        columns: [
          col('attendanceStatus', '"AttendanceStatus"', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'AttendanceStatus' } },
          }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('declineReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('memberId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('seatNumber', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('secureToken', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('teamId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('tournamentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Team',
        columns: [
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('placement', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('totalKills', 'int4', { default: lit(0), codecRef: { codecId: 'pg/int4@1' } }),
          col('totalPoints', 'int4', { default: lit(0), codecRef: { codecId: 'pg/int4@1' } }),
          col('tournamentId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Tournament',
        columns: [
          col('clanId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('game', 'text', {
            notNull: true,
            default: lit('Call of Duty Mobile'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('maxPlayers', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('mode', '"GameMode"', {
            notNull: true,
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'GameMode' } },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('registrationEnd', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('status', '"TournamentStatus"', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'TournamentStatus' } },
          }),
          col('teamSize', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tournamentDate', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('clanId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamp(3)', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', '"Role"', {
            notNull: true,
            default: lit('MODERATOR'),
            codecRef: { codecId: 'pg/enum@1', typeParams: { typeName: 'Role' } },
          }),
          col('updatedAt', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-temporal@1', typeParams: { precision: 3 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Member',
        index: 'Member_codmUid_key',
        columns: ['codmUid'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Member',
        index: 'Member_codmUsername_key',
        columns: ['codmUsername'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Member',
        index: 'Member_playerId_key',
        columns: ['playerId'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Member',
        index: 'Member_whatsappNumber_key',
        columns: ['whatsappNumber'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Participant',
        index: 'Participant_memberId_tournamentId_key',
        columns: ['memberId', 'tournamentId'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'Participant',
        index: 'Participant_secureToken_key',
        columns: ['secureToken'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'User',
        index: 'User_email_key',
        columns: ['email'],
        extras: { unique: true },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'AuditLog',
        foreignKey: {
          name: 'AuditLog_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Member',
        foreignKey: {
          name: 'Member_clanId_fkey',
          columns: ['clanId'],
          references: { schema: 'public', table: 'Clan', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Participant',
        foreignKey: {
          name: 'Participant_memberId_fkey',
          columns: ['memberId'],
          references: { schema: 'public', table: 'Member', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Participant',
        foreignKey: {
          name: 'Participant_tournamentId_fkey',
          columns: ['tournamentId'],
          references: { schema: 'public', table: 'Tournament', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Participant',
        foreignKey: {
          name: 'Participant_teamId_fkey',
          columns: ['teamId'],
          references: { schema: 'public', table: 'Team', columns: ['id'] },
          onDelete: 'setNull',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Team',
        foreignKey: {
          name: 'Team_tournamentId_fkey',
          columns: ['tournamentId'],
          references: { schema: 'public', table: 'Tournament', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Tournament',
        foreignKey: {
          name: 'Tournament_clanId_fkey',
          columns: ['clanId'],
          references: { schema: 'public', table: 'Clan', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'User',
        foreignKey: {
          name: 'User_clanId_fkey',
          columns: ['clanId'],
          references: { schema: 'public', table: 'Clan', columns: ['id'] },
          onDelete: 'setNull',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
