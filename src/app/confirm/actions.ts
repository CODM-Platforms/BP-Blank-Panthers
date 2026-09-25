'use server';

import { db } from '@/prisma/db';
import { revalidatePath } from 'next/cache';

async function loadParticipant(token: string) {
  return db.orm.public.Participant
    .where({ secureToken: token })
    .include('tournament', (t) => t)
    .include('member', (m) => m)
    .first();
}

export async function confirmAttendance(token: string): Promise<{ error?: string }> {
  const participant = await loadParticipant(token);
  if (!participant) return { error: 'Invalid or expired link.' };
  // tournament/member are required relations; typed optional only due to a
  // known Prisma 8 rc metadata gap, not a real possibility here.
  const tournament = participant.tournament!;
  const member = participant.member!;
  if (tournament.status !== 'PUBLISHED' && tournament.status !== 'ONGOING') {
    return { error: 'This tournament is no longer accepting responses.' };
  }

  await db.orm.public.Participant.where({ id: participant.id }).update({ attendanceStatus: 'CONFIRMED' });
  await db.orm.public.Member.where({ id: participant.memberId }).update({
    tournamentsConfirmed: member.tournamentsConfirmed + 1,
  });

  revalidatePath(`/admin/tournaments/${participant.tournamentId}`);
  return {};
}

export async function declineAttendance(token: string, reason: string): Promise<{ error?: string }> {
  const participant = await loadParticipant(token);
  if (!participant) return { error: 'Invalid or expired link.' };
  const tournament = participant.tournament!;
  const member = participant.member!;
  if (tournament.status !== 'PUBLISHED' && tournament.status !== 'ONGOING') {
    return { error: 'This tournament is no longer accepting responses.' };
  }

  await db.orm.public.Participant.where({ id: participant.id }).update({
    attendanceStatus: 'DECLINED',
    declineReason: reason || null,
  });
  await db.orm.public.Member.where({ id: participant.memberId }).update({
    tournamentsDeclined: member.tournamentsDeclined + 1,
  });

  revalidatePath(`/admin/tournaments/${participant.tournamentId}`);
  return {};
}
