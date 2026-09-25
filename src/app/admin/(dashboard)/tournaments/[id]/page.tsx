import { Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/prisma/db';
import { toJsDate, sanitizeForClient } from '@/lib/temporal';
import { publishTournament, cancelTournament } from '@/app/admin/tournaments/actions';
import TournamentParticipants from '@/components/admin/TournamentParticipants';

export default async function TournamentControlCenter({ params }: { params: { id: string } }) {
  let tournament = null;
  try {
    tournament = await db.orm.public.Tournament
      .where({ id: params.id })
      .include('participants', (p) => p.include('member', (m) => m).include('team', (t) => t))
      .include('teams', (t) => t)
      .first();
  } catch (e) {
    console.error('DB error', e);
  }

  if (!tournament) {
    notFound();
  }

  const participants = tournament.participants;
  const confirmed = participants.filter((p: any) => p.attendanceStatus === 'CONFIRMED').length;
  const declined = participants.filter((p: any) => p.attendanceStatus === 'DECLINED').length;
  const pending = participants.filter((p: any) => p.attendanceStatus === 'PENDING').length;
  const requiredSquads = Math.ceil(confirmed / tournament.teamSize) || 0;

  const doPublish = publishTournament.bind(null, tournament.id);
  const doCancel = cancelTournament.bind(null, tournament.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/tournaments" className="text-sm text-outline hover:text-primary-container mb-2 inline-block">
            &larr; Back to Tournaments
          </Link>
          <h1 className="text-3xl font-bold text-on-surface uppercase">{tournament.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm font-mono text-outline">
            <span className="px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded text-on-surface">{tournament.mode} | {tournament.teamSize}v{tournament.teamSize}</span>
            <span>•</span>
            <span>{toJsDate(tournament.tournamentDate).toLocaleDateString()}</span>
            <span>•</span>
            <span className="uppercase">{tournament.status}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/tournaments/${tournament.id}/teams`} className="px-4 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface hover:border-primary-container hover:text-primary-container transition-colors flex items-center gap-2">
            <Users className="w-4 h-4" /> Team Builder
          </Link>
          {tournament.status === 'DRAFT' && (
            <form action={doPublish}>
              <button type="submit" className="px-4 py-2 bg-primary-container text-surface-container-lowest rounded-lg font-bold hover:bg-primary-fixed-dim transition-colors flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Publish
              </button>
            </form>
          )}
          {tournament.status !== 'CANCELLED' && tournament.status !== 'COMPLETED' && (
            <form action={doCancel}>
              <button type="submit" className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-bold hover:bg-red-500/20 transition-colors">
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participants Summary */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-container" /> Participants
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <span className="text-outline">Invited</span>
              <span className="font-bold text-on-surface">{participants.length}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <span className="text-outline">Confirmed</span>
              <span className="font-bold text-green-400">{confirmed}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <span className="text-outline">Declined</span>
              <span className="font-bold text-red-400">{declined}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline">Pending</span>
              <span className="font-bold text-yellow-400">{pending}</span>
            </div>
          </div>
        </div>

        {/* Squad Auto-Calculation */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
          <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-container" /> Squad Formation
          </h2>
          <div className="mb-6">
            <p className="text-sm text-outline mb-1">Squad Math ({tournament.mode})</p>
            <p className="text-xl font-mono text-on-surface">{confirmed} players &divide; {tournament.teamSize} = <span className="text-primary-container font-bold">{requiredSquads} Squads</span></p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
              <span className="text-outline">Required Squads</span>
              <span className="font-bold text-on-surface">{requiredSquads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline">Created Squads</span>
              <span className="font-bold text-on-surface">{tournament.teams.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <TournamentParticipants participants={sanitizeForClient(participants)} />
    </div>
  );
}
