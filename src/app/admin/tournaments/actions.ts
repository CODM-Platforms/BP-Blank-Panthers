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

  let tournament;
  try {
    tournament = await db.orm.public.Tournament.create({
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
  } catch (e) {
    console.error('Tournament creation failed', e);
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to create tournament: ${detail}`);
  }

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

  const statusAction = (formData.get('status_action') as string) || 'ongoing';
  const teams = await db.orm.public.Team.where({ tournamentId }).all();
  const participants = await db.orm.public.Participant.where({ tournamentId }).all();

  // 1. Update individual player kills and sum kills per team
  const teamPlayerKillsSum = new Map<string, number>();

  for (const participant of participants) {
    const baseKillsRaw = formData.get(`player_kills_${participant.id}`) as string;
    const addKillsRaw = formData.get(`add_player_kills_${participant.id}`) as string;

    const hasInput = baseKillsRaw !== null || addKillsRaw !== null;
    const baseKills =
      baseKillsRaw !== '' && baseKillsRaw !== null
        ? Number(baseKillsRaw)
        : (participant.kills ?? 0);
    const addKills = addKillsRaw ? Number(addKillsRaw) : 0;
    const updatedKills = Math.max(
      0,
      (isNaN(baseKills) ? 0 : baseKills) + (isNaN(addKills) ? 0 : addKills)
    );

    if (hasInput && updatedKills !== (participant.kills ?? 0)) {
      await db.orm.public.Participant.where({ id: participant.id }).update({
        kills: updatedKills,
      });
    }

    if (participant.teamId) {
      teamPlayerKillsSum.set(
        participant.teamId,
        (teamPlayerKillsSum.get(participant.teamId) ?? 0) + updatedKills
      );
    }
  }

  // 2. Update team points, kills, and placements
  const teamUpdates: Array<{
    id: string;
    placement: number | null;
    totalPoints: number;
    totalKills: number;
  }> = [];

  for (const team of teams) {
    const placementRaw = formData.get(`placement_${team.id}`) as string;
    const pointsRaw = formData.get(`points_${team.id}`) as string;
    const killsRaw = formData.get(`kills_${team.id}`) as string;
    const addPointsRaw = formData.get(`add_points_${team.id}`) as string;

    const basePoints = pointsRaw !== '' && pointsRaw !== null ? Number(pointsRaw) : (team.totalPoints ?? 0);
    const addPoints = addPointsRaw ? Number(addPointsRaw) : 0;
    const totalPoints = Math.max(0, (isNaN(basePoints) ? 0 : basePoints) + (isNaN(addPoints) ? 0 : addPoints));

    const manualTeamKills = killsRaw !== '' && killsRaw !== null ? Number(killsRaw) : (team.totalKills ?? 0);
    const summedPlayerKills = teamPlayerKillsSum.get(team.id) ?? 0;
    // If players in this squad have recorded kills, auto-sum their kills into the team total (unless manual override is higher)
    const totalKills = summedPlayerKills > 0 ? summedPlayerKills : (isNaN(manualTeamKills) ? 0 : manualTeamKills);
    const placement = placementRaw ? Number(placementRaw) : null;

    teamUpdates.push({
      id: team.id,
      placement,
      totalPoints,
      totalKills,
    });
  }

  // Auto-calculate placement by descending points if not all manually set
  const hasManualPlacements = teamUpdates.every((t) => t.placement !== null && t.placement > 0);
  if (!hasManualPlacements) {
    const sorted = [...teamUpdates].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.totalKills - a.totalKills;
    });
    sorted.forEach((teamUpdate, index) => {
      if (!teamUpdate.placement) {
        teamUpdate.placement = index + 1;
      }
    });
  }

  for (const update of teamUpdates) {
    await db.orm.public.Team.where({ id: update.id }).update({
      placement: update.placement,
      totalPoints: update.totalPoints,
      totalKills: update.totalKills,
    });
  }

  const newStatus = statusAction === 'completed' ? 'COMPLETED' : 'ONGOING';
  await db.orm.public.Tournament.where({ id: tournamentId }).update({ status: newStatus });

  await db.orm.public.AuditLog.create({
    action: newStatus === 'COMPLETED' ? 'TOURNAMENT_COMPLETED' : 'TOURNAMENT_SCORES_UPDATED',
    details: `Scores and player kills updated for tournament ${tournamentId} (Status set to: ${newStatus}) by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tournaments');
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath('/tournaments');
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/');
  redirect(`/admin/tournaments/${tournamentId}`);
}

export async function setTournamentStatus(
  tournamentId: string,
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  await db.orm.public.Tournament.where({ id: tournamentId }).update({ status });

  await db.orm.public.AuditLog.create({
    action: 'TOURNAMENT_STATUS_UPDATED',
    details: `Tournament ${tournamentId} status set to ${status} by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin');
  revalidatePath('/admin/tournaments');
  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath('/tournaments');
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath('/');
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

  const statusRaw = formData.get('status') as string;

  if (!name || !mode || !teamSize || !maxPlayers || isNaN(tournamentDate.getTime()) || isNaN(tournamentEnd.getTime()) || isNaN(registrationEnd.getTime())) {
    throw new Error('Missing or invalid tournament fields.');
  }
  if (tournamentEnd.getTime() <= tournamentDate.getTime()) {
    throw new Error('End Time must be after Start Time.');
  }

  const updatePayload: any = {
    name,
    mode: mode as 'BR' | 'MP' | 'CUSTOM',
    teamSize,
    maxPlayers,
    tournamentDate: toTemporalDateTime(tournamentDate),
    tournamentEnd: toTemporalDateTime(tournamentEnd),
    registrationEnd: toTemporalDateTime(registrationEnd),
  };
  if (statusRaw && ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(statusRaw)) {
    updatePayload.status = statusRaw;
  }

  await db.orm.public.Tournament.where({ id: tournamentId }).update(updatePayload);

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

export async function createTournamentTeam(tournamentId: string, name: string) {
  const actor = await getSessionUser();
  if (!actor) throw new Error('Not authorized');

  const trimmed = name.trim();
  if (!trimmed) throw new Error('Team name is required');

  await db.orm.public.Team.create({
    tournamentId,
    name: trimmed,
  });

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}/teams`);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function deleteTournamentTeam(teamId: string, tournamentId: string) {
  const actor = await getSessionUser();
  if (!actor) throw new Error('Not authorized');

  await db.orm.public.Participant.where({ teamId }).update({ teamId: null, seatNumber: null });
  await db.orm.public.Team.where({ id: teamId }).delete();

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}/teams`);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function assignPlayerToTeam(participantId: string, teamId: string | null, tournamentId: string) {
  const actor = await getSessionUser();
  if (!actor) throw new Error('Not authorized');

  if (teamId) {
    const existing = await db.orm.public.Participant.where({ teamId }).all();
    const nextSeat = existing.length + 1;
    await db.orm.public.Participant.where({ id: participantId }).update({
      teamId,
      seatNumber: nextSeat,
    });
  } else {
    await db.orm.public.Participant.where({ id: participantId }).update({
      teamId: null,
      seatNumber: null,
    });
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}/teams`);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function addMemberDirectlyToTeam(tournamentId: string, memberId: string, teamId: string) {
  const actor = await getSessionUser();
  if (!actor) throw new Error('Not authorized');

  const participant = await db.orm.public.Participant
    .where({ tournamentId, memberId })
    .first();

  const existingTeamMembers = await db.orm.public.Participant.where({ teamId }).all();
  const seatNumber = existingTeamMembers.length + 1;

  if (!participant) {
    await db.orm.public.Participant.create({
      tournamentId,
      memberId,
      attendanceStatus: 'CONFIRMED',
      secureToken: randomUUID(),
      teamId,
      seatNumber,
    });

    const member = await db.orm.public.Member.first({ id: memberId });
    if (member) {
      await db.orm.public.Member.where({ id: memberId }).update({
        tournamentsInvited: member.tournamentsInvited + 1,
        tournamentsConfirmed: member.tournamentsConfirmed + 1,
      });
    }
  } else {
    await db.orm.public.Participant.where({ id: participant.id }).update({
      teamId,
      seatNumber,
      attendanceStatus: participant.attendanceStatus === 'DECLINED' ? 'CONFIRMED' : participant.attendanceStatus,
    });
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}/teams`);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function autoGenerateTournamentTeams(tournamentId: string) {
  const actor = await getSessionUser();
  if (!actor) throw new Error('Not authorized');

  const tournament = await db.orm.public.Tournament.first({ id: tournamentId });
  if (!tournament) throw new Error('Tournament not found');

  const participants = await db.orm.public.Participant
    .where({ tournamentId })
    .where((p) => p.teamId.isNull())
    .all();

  if (participants.length === 0) {
    throw new Error('No unassigned players to form squads.');
  }

  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const teamSize = tournament.teamSize || 3;
  const teamPresets = [
    'TEAM ALPHA', 'TEAM BETA', 'TEAM GAMMA', 'TEAM DELTA',
    'TEAM EPSILON', 'TEAM ZETA', 'TEAM ETA', 'TEAM THETA',
    'TEAM IOTA', 'TEAM KAPPA', 'TEAM LAMBDA', 'TEAM SIGMA'
  ];

  const existingTeams = await db.orm.public.Team.where({ tournamentId }).all();
  let nameIndex = existingTeams.length;

  for (let i = 0; i < shuffled.length; i += teamSize) {
    const squad = shuffled.slice(i, i + teamSize);
    const teamName = teamPresets[nameIndex] || `SQUAD ${nameIndex + 1}`;
    nameIndex++;

    const team = await db.orm.public.Team.create({
      tournamentId,
      name: teamName,
    });

    for (let seat = 0; seat < squad.length; seat++) {
      await db.orm.public.Participant.where({ id: squad[seat].id }).update({
        teamId: team.id,
        seatNumber: seat + 1,
      });
    }
  }

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}/teams`);
  revalidatePath(`/tournaments/${tournamentId}`);
}

export async function resetTournamentTeams(tournamentId: string) {
  const actor = await getSessionUser();
  if (!actor) throw new Error('Not authorized');

  await db.orm.public.Participant.where({ tournamentId }).update({ teamId: null, seatNumber: null });
  await db.orm.public.Team.where({ tournamentId }).delete();

  revalidatePath(`/admin/tournaments/${tournamentId}`);
  revalidatePath(`/admin/tournaments/${tournamentId}/teams`);
  revalidatePath(`/tournaments/${tournamentId}`);
}
