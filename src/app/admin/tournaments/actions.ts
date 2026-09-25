'use server';

import { db } from '@/prisma/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function createTournament(formData: FormData) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const clan = await db.orm.public.Clan.first();
  if (!clan) {
    throw new Error('No clan found - seed the database first.');
  }

  const name = formData.get('name') as string;
  const mode = formData.get('mode') as string;
  const teamSize = Number(formData.get('teamSize'));
  const maxPlayers = Number(formData.get('maxPlayers'));
  const tournamentDate = new Date(formData.get('tournamentDate') as string);
  const registrationEnd = new Date(formData.get('registrationEnd') as string);

  if (!name || !mode || !teamSize || !maxPlayers || isNaN(tournamentDate.getTime()) || isNaN(registrationEnd.getTime())) {
    throw new Error('Missing or invalid tournament fields.');
  }

  const tournament = await db.orm.public.Tournament.create({
    clanId: clan.id,
    name,
    mode: mode as 'BR' | 'MP' | 'CUSTOM',
    teamSize,
    maxPlayers,
    tournamentDate,
    registrationEnd,
    status: 'PUBLISHED',
  });

  await db.orm.public.AuditLog.create({
    action: 'TOURNAMENT_CREATED',
    details: `Tournament "${name}" created and published by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tournaments');
  redirect(`/admin/tournaments/${tournament.id}`);
}

export async function publishTournament(tournamentId: string) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  await db.orm.public.Tournament.where({ id: tournamentId }).update({ status: 'PUBLISHED' });

  await db.orm.public.AuditLog.create({
    action: 'TOURNAMENT_PUBLISHED',
    details: `Tournament ${tournamentId} published by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath('/tournaments');
}

export async function inviteMembersToTournament(tournamentId: string, formData: FormData) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const memberIds = formData.getAll('memberIds') as string[];

  for (const memberId of memberIds) {
    try {
      await db.orm.public.Participant.create({
        memberId,
        tournamentId,
        attendanceStatus: 'PENDING',
        secureToken: randomUUID(),
      });

      const member = await db.orm.public.Member.first({ id: memberId });
      if (member) {
        await db.orm.public.Member.where({ id: memberId }).update({
          tournamentsInvited: member.tournamentsInvited + 1,
        });
      }
    } catch (e) {
      console.error(`Failed to invite member ${memberId} - likely already invited.`, e);
    }
  }

  if (memberIds.length > 0) {
    await db.orm.public.AuditLog.create({
      action: 'TOURNAMENT_MEMBERS_INVITED',
      details: `${memberIds.length} member(s) invited to tournament ${tournamentId} by ${actor.name} (${actor.id}).`,
      userId: actor.id,
    });
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  redirect(`/admin/tournaments/${tournamentId}`);
}

export async function cancelTournament(tournamentId: string) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  await db.orm.public.Tournament.where({ id: tournamentId }).update({ status: 'CANCELLED' });

  await db.orm.public.AuditLog.create({
    action: 'TOURNAMENT_CANCELLED',
    details: `Tournament ${tournamentId} cancelled by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath('/tournaments');
}
