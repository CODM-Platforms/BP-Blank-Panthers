import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import { toJsDate } from '@/lib/temporal';
import ConfirmAttendanceClient from '@/components/ConfirmAttendanceClient';

export default async function ConfirmAttendance({ params }: { params: { token: string } }) {
  let participant = null;
  try {
    participant = await db.orm.public.Participant
      .where({ secureToken: params.token })
      .include('tournament', (t) => t)
      .include('member', (m) => m)
      .first();
  } catch (e) {
    console.error('DB error', e);
  }

  if (!participant) {
    notFound();
  }

  // tournament/member are required relations; typed optional only due to a
  // known Prisma 8 rc metadata gap, not a real possibility here.
  const tournament = participant.tournament!;
  const member = participant.member!;
  const tournamentDate = toJsDate(tournament.tournamentDate);

  return (
    <ConfirmAttendanceClient
      token={params.token}
      playerName={member.fullName}
      tournamentName={tournament.name}
      tournamentDate={tournamentDate.toLocaleDateString()}
      tournamentTime={tournamentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      tournamentMode={tournament.mode}
      initialStatus={participant.attendanceStatus}
    />
  );
}
