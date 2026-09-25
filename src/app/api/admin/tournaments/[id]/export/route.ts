import { db } from '@/prisma/db';
import { getSessionUser } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await getSessionUser();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const tournament = await db.orm.public.Tournament.first({ id: params.id });
  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  const participants = await db.orm.public.Participant
    .where({ tournamentId: params.id })
    .where((p) => p.attendanceStatus.eq('CONFIRMED'))
    .include('member', (m) => m)
    .include('team', (t) => t)
    .all();

  const header = [
    'Full Name',
    'Player ID',
    'CODM IGN',
    'UID',
    'Device',
    'Device Serial',
    'Phone/WhatsApp',
    'Country',
    'Region',
    'Preferred Mode',
    'Status',
    'Team',
  ];
  const rows = participants.map((p: any) => [
    p.member.fullName,
    p.member.playerId,
    p.member.codmUsername,
    p.member.codmUid,
    p.member.deviceModel,
    p.member.deviceSerial,
    p.member.whatsappNumber,
    p.member.country,
    p.member.region,
    p.member.preferredMode,
    p.member.status,
    p.team?.name ?? '',
  ]);

  const csv = [header, ...rows].map((row) => row.map((v) => csvEscape(String(v))).join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${tournament.name.replace(/[^a-z0-9]/gi, '_')}_confirmed.csv"`,
    },
  });
}
