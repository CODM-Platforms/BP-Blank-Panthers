import { Users, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/prisma/db';
import { toJsDate } from '@/lib/temporal';
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
          <Link href="/admin/tournaments" className="text-sm text-panther-text hover:text-panther-gold mb-2 inline-block">
            &larr; Back to Tournaments
          </Link>
          <h1 className="text-3xl font-bold text-white uppercase">{tournament.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm font-mono text-panther-text">
            <span className="px-2 py-1 bg-panther-dark border border-panther-border rounded text-white">{tournament.mode} | {tournament.teamSize}v{tournament.teamSize}</span>
            <span>•</span>
            <span>{toJsDate(tournament.tournamentDate).toLocaleDateString()}</span>
            <span>•</span>
            <span className="uppercase">{tournament.status}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/admin/tournaments/${tournament.id}/teams`} className="px-4 py-2 bg-panther-dark border border-panther-border rounded-lg text-white hover:border-panther-gold hover:text-panther-gold transition-colors flex items-center gap-2">
            <Users className="w-4 h-4" /> Team Builder
          </Link>
          {tournament.status === 'DRAFT' && (
            <form action={doPublish}>
              <button type="submit" className="px-4 py-2 bg-panther-gold text-panther-dark rounded-lg font-bold hover:bg-panther-gold-hover transition-colors flex items-center gap-2">
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
        <div className="bg-panther-card border border-panther-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-panther-gold" /> Participants
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Invited</span>
              <span className="font-bold text-white">{participants.length}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Confirmed</span>
              <span className="font-bold text-green-400">{confirmed}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Declined</span>
              <span className="font-bold text-red-400">{declined}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-panther-text">Pending</span>
              <span className="font-bold text-yellow-400">{pending}</span>
            </div>
          </div>
        </div>

        {/* Squad Auto-Calculation */}
        <div className="bg-panther-card border border-panther-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-panther-gold" /> Squad Formation
          </h2>
          <div className="mb-6">
            <p className="text-sm text-panther-text mb-1">Squad Math ({tournament.mode})</p>
            <p className="text-xl font-mono text-white">{confirmed} players &divide; {tournament.teamSize} = <span className="text-panther-gold font-bold">{requiredSquads} Squads</span></p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Required Squads</span>
              <span className="font-bold text-white">{requiredSquads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-panther-text">Created Squads</span>
              <span className="font-bold text-white">{tournament.teams.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <TournamentParticipants participants={participants} />
    </div>
  );
}
