import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import { toJsDate } from '@/lib/temporal';

export default async function PublicTournamentDetail({ params }: { params: { id: string } }) {
  let tournament = null;
  try {
    tournament = await db.orm.public.Tournament
      .where({ id: params.id })
      .include('participants', (p) => p.where((pp) => pp.attendanceStatus.eq('CONFIRMED')).include('member', (m) => m).include('team', (t) => t))
      .include('teams', (t) => t.orderBy((tm) => tm.placement.asc()))
      .first();
  } catch (e) {
    console.error('DB error', e);
  }

  if (!tournament) {
    notFound();
  }

  const isCompleted = tournament.status === 'COMPLETED';
  const teamGroups = new Map<string, any[]>();
  for (const p of tournament.participants) {
    const key = p.team?.name ?? 'Unassigned';
    if (!teamGroups.has(key)) teamGroups.set(key, []);
    teamGroups.get(key)!.push(p);
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/95 via-surface-container-lowest/90 to-surface-container-lowest/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0c0e12_85%)]"></div>
      </div>

      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start pt-10 pb-margin">
        <div className="w-full max-w-5xl mx-auto px-margin-mobile md:px-margin">
          <Link href="/tournaments" className="text-primary-container text-sm hover:underline mb-6 inline-block">&larr; Back to Tournaments</Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight">{tournament.name}</h1>
              <div className="flex items-center gap-3 mt-3 text-sm font-mono text-outline">
                <span className="px-2 py-1 bg-surface-container-highest border border-surface-container-high rounded text-on-surface">{tournament.mode} | {tournament.teamSize}v{tournament.teamSize}</span>
                <span>{toJsDate(tournament.tournamentDate).toLocaleDateString()}</span>
              </div>
            </div>
            <span className={
              isCompleted
                ? 'px-3 py-1 bg-primary-container/10 border border-primary-container/30 text-primary-container text-xs font-mono uppercase tracking-widest rounded-full self-start'
                : 'px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest rounded-full self-start'
            }>
              {tournament.status}
            </span>
          </div>

          {isCompleted ? (
            <div className="flex flex-col gap-space-md">
              <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">emoji_events</span> Final Standings
              </h2>
              {tournament.teams.length === 0 ? (
                <p className="text-outline text-sm">No results recorded.</p>
              ) : (
                tournament.teams.map((team: any, i: number) => (
                  <div key={team.id} className="bg-surface-container-low/80 border border-surface-container-high rounded-xl p-space-md flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="font-headline-md text-headline-md text-primary-container w-10 text-center">{team.placement ?? i + 1}</span>
                      <div>
                        <p className="font-title-md text-on-surface font-bold">{team.name}</p>
                        <p className="text-xs text-outline font-mono">
                          {(teamGroups.get(team.name) ?? []).map((p: any) => p.member.codmUsername).join(', ') || 'No roster recorded'}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-primary-container text-lg">{team.totalPoints ?? 0} pts</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-space-md">
              <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">groups</span> Confirmed Roster ({tournament.participants.length})
              </h2>
              {teamGroups.size === 0 ? (
                <p className="text-outline text-sm">No confirmations yet.</p>
              ) : (
                Array.from(teamGroups.entries()).map(([teamName, members]) => (
                  <div key={teamName} className="bg-surface-container-low/80 border border-surface-container-high rounded-xl p-space-md">
                    <p className="font-title-sm text-primary-container uppercase tracking-widest text-sm mb-2">{teamName}</p>
                    <div className="flex flex-wrap gap-2">
                      {members.map((p: any) => (
                        <span key={p.id} className="px-2 py-1 bg-surface-container-highest border border-surface-container-high rounded font-mono text-xs text-on-surface">
                          {p.member.codmUsername}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 w-full px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-surface-container-high/30 bg-surface-container-lowest mt-10">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">© 2026 BP Black Panthers Esports</span>
      </footer>
    </div>
  );
}
