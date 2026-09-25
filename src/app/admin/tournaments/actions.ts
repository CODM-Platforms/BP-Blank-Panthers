'use server';

import { db } from '@/prisma/db';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { toTemporalDateTime, toJsDate } from '@/lib/temporal';

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
  const tournamentEnd = new Date(formData.get('tournamentEnd') as string);
  const registrationEnd = new Date(formData.get('registrationEnd') as string);

  if (!name || !mode || !teamSize || !maxPlayers || isNaN(tournamentDate.getTime()) || isNaN(tournamentEnd.getTime()) || isNaN(registrationEnd.getTime())) {
    throw new Error('Missing or invalid tournament fields.');
  }
  if (tournamentEnd.getTime() <= tournamentDate.getTime()) {
    throw new Error('End Time must be after Start Time.');
  }

  const tournament = await db.orm.public.Tournament.create({
    clanId: clan.id,
    name,
    mode: mode as 'BR' | 'MP' | 'CUSTOM',
    teamSize,
    maxPlayers,
    tournamentDate: toTemporalDateTime(tournamentDate),
    tournamentEnd: toTemporalDateTime(tournamentEnd),
    registrationEnd: toTemporalDateTime(registrationEnd),
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

export async function markAttendance(participantId: string, status: 'ATTENDED' | 'NO_SHOW') {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const participant = await db.orm.public.Participant.first({ id: participantId });
  if (!participant || participant.attendanceStatus === status) {
    return;
  }

  const previousStatus = participant.attendanceStatus;
  await db.orm.public.Participant.where({ id: participantId }).update({ attendanceStatus: status });

  const member = await db.orm.public.Member.first({ id: participant.memberId });
  if (member) {
    // Undo whichever counter the previous status had bumped before applying
    // the new one, so flipping a wrong auto/manual mark doesn't double-count.
    let tournamentsAttended = member.tournamentsAttended;
    let tournamentsMissed = member.tournamentsMissed;
    if (previousStatus === 'ATTENDED') tournamentsAttended = Math.max(0, tournamentsAttended - 1);
    if (previousStatus === 'NO_SHOW') tournamentsMissed = Math.max(0, tournamentsMissed - 1);
    if (status === 'ATTENDED') tournamentsAttended += 1;
    if (status === 'NO_SHOW') tournamentsMissed += 1;

    await db.orm.public.Member.where({ id: member.id }).update({ tournamentsAttended, tournamentsMissed });
  }

  revalidatePath(`/admin/tournaments/${participant.tournamentId}`);
  revalidatePath(`/tournaments/${participant.tournamentId}`);
}

// Once a tournament's start time has passed, there's no real-world signal
// left to click "Attended" for - everyone who confirmed showed up unless a
// clan master says otherwise. Auto-promotes CONFIRMED to ATTENDED so the
// admin only has to act on the exceptions (via markAttendance) instead of
// clicking through every single confirmed player by hand. Called from the
// tournament control-center page on every load rather than on a schedule -
// this deployment has no cron runner, and re-running it is a no-op once
// there's nothing left in CONFIRMED.
export async function autoProgressAttendance(tournamentId: string) {
  const tournament = await db.orm.public.Tournament.first({ id: tournamentId });
  if (!tournament) return;
  if (tournament.status === 'DRAFT' || tournament.status === 'COMPLETED' || tournament.status === 'CANCELLED') return;
  // Only promote once the event has actually ended, not merely started -
  // older tournaments created before tournamentEnd existed fall back to
  // the start time.
  const effectiveEnd = tournament.tournamentEnd ? toJsDate(tournament.tournamentEnd) : toJsDate(tournament.tournamentDate);
  if (effectiveEnd.getTime() > Date.now()) return;

  const stillConfirmed = await db.orm.public.Participant
    .where({ tournamentId })
    .where((p) => p.attendanceStatus.eq('CONFIRMED'))
    .all();

  for (const participant of stillConfirmed) {
    await db.orm.public.Participant.where({ id: participant.id }).update({ attendanceStatus: 'ATTENDED' });
    const member = await db.orm.public.Member.first({ id: participant.memberId });
    if (member) {
      await db.orm.public.Member.where({ id: member.id }).update({ tournamentsAttended: member.tournamentsAttended + 1 });
    }
  }
}

export async function saveResultsAndComplete(tournamentId: string, formData: FormData) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const teams = await db.orm.public.Team.where({ tournamentId }).all();
  for (const team of teams) {
    const placementRaw = formData.get(`placement_${team.id}`) as string;
    const pointsRaw = formData.get(`points_${team.id}`) as string;
    const placement = placementRaw ? Number(placementRaw) : null;
    const totalPoints = pointsRaw ? Number(pointsRaw) : 0;

    await db.orm.public.Team.where({ id: team.id }).update({ placement, totalPoints });
  }

  await db.orm.public.Tournament.where({ id: tournamentId }).update({ status: 'COMPLETED' });

  await db.orm.public.AuditLog.create({
    action: 'TOURNAMENT_RESULTS_SAVED',
    details: `Results saved and tournament ${tournamentId} marked completed by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tournaments');
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath('/tournaments');
  revalidatePath(`/tournaments/${tournamentId}`);
  redirect(`/admin/tournaments/${tournamentId}`);
}

export async function addTournamentPhoto(tournamentId: string, formData: FormData) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const imageUrl = formData.get('imageUrl') as string;
  const caption = (formData.get('caption') as string) || null;

  if (!imageUrl) {
    throw new Error('No image provided.');
  }

  await db.orm.public.TournamentPhoto.create({
    tournamentId,
    imageUrl,
    caption,
  });

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function deleteTournamentPhoto(photoId: string, tournamentId: string) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  await db.orm.public.TournamentPhoto.where({ id: photoId }).delete();

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}`);
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

export async function updateTournament(tournamentId: string, formData: FormData) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const name = formData.get('name') as string;
  const mode = formData.get('mode') as string;
  const teamSize = Number(formData.get('teamSize'));
  const maxPlayers = Number(formData.get('maxPlayers'));
  const tournamentDate = new Date(formData.get('tournamentDate') as string);
  const tournamentEnd = new Date(formData.get('tournamentEnd') as string);
  const registrationEnd = new Date(formData.get('registrationEnd') as string);

  if (!name || !mode || !teamSize || !maxPlayers || isNaN(tournamentDate.getTime()) || isNaN(tournamentEnd.getTime()) || isNaN(registrationEnd.getTime())) {
    throw new Error('Missing or invalid tournament fields.');
  }
  if (tournamentEnd.getTime() <= tournamentDate.getTime()) {
    throw new Error('End Time must be after Start Time.');
  }

  await db.orm.public.Tournament.where({ id: tournamentId }).update({
    name,
    mode: mode as 'BR' | 'MP' | 'CUSTOM',
    teamSize,
    maxPlayers,
    tournamentDate: toTemporalDateTime(tournamentDate),
    tournamentEnd: toTemporalDateTime(tournamentEnd),
    registrationEnd: toTemporalDateTime(registrationEnd),
  });

  await db.orm.public.AuditLog.create({
    action: 'TOURNAMENT_UPDATED',
    details: `Tournament "${name}" (${tournamentId}) edited by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tournaments');
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath('/tournaments');
  revalidatePath(`/tournaments/${tournamentId}`);
  redirect(`/admin/tournaments/${tournamentId}`);
}

export async function deleteTournament(tournamentId: string) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const tournament = await db.orm.public.Tournament.first({ id: tournamentId });
  if (!tournament) {
    throw new Error('Tournament not found');
  }

  // Clear dependents first - none of these relations cascade at the DB
  // level, and Participant.teamId would block deleting Team rows otherwise.
  await db.orm.public.TournamentPhoto.where({ tournamentId }).delete();
  await db.orm.public.Participant.where({ tournamentId }).delete();
  await db.orm.public.Team.where({ tournamentId }).delete();
  await db.orm.public.Tournament.where({ id: tournamentId }).delete();

  await db.orm.public.AuditLog.create({
    action: 'TOURNAMENT_DELETED',
    details: `Tournament "${tournament.name}" (${tournamentId}) deleted by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tournaments');
  revalidatePath('/tournaments');
  redirect('/admin/tournaments');
}
