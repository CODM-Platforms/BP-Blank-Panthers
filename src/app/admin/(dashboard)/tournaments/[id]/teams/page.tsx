import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import TeamBuilderClient from '@/components/admin/TeamBuilderClient';
import { sanitizeForClient } from '@/lib/temporal';

export default async function ManualTeamBuilder({ params }: { params: { id: string } }) {
  let tournament = null;
  let teams: any[] = [];
  let unassignedParticipants: any[] = [];
  let activeClanMembers: any[] = [];

  try {
    tournament = await db.orm.public.Tournament.first({ id: params.id });
    if (!tournament) notFound();

    teams = await db.orm.public.Team
      .where({ tournamentId: params.id })
      .orderBy((t) => t.createdAt.asc())
      .include('participants', (p) =>
        p
          .orderBy((pp) => pp.seatNumber.asc())
          .include('member', (m) => m)
      )
      .all();

    unassignedParticipants = await db.orm.public.Participant
      .where((p) => p.tournamentId.eq(params.id))
      .where((p) => p.teamId.isNull())
      .include('member', (m) => m)
      .all();

    activeClanMembers = await db.orm.public.Member
      .where({ status: 'ACTIVE' })
      .orderBy((m) => m.fullName.asc())
      .all();
  } catch (e) {
    console.error('DB error loading team builder', e);
  }

  if (!tournament) {
    notFound();
  }

  return (
    <TeamBuilderClient
      tournament={sanitizeForClient(tournament)}
      teams={sanitizeForClient(teams)}
      unassignedParticipants={sanitizeForClient(unassignedParticipants)}
      activeClanMembers={sanitizeForClient(activeClanMembers)}
    />
  );
}
