import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import { toJsDate } from '@/lib/temporal';

export default async function PublicTournamentDetail({ params }: { params: { id: string } }) {
  let tournament = null;
  let dbError = false;
  try {
    tournament = await db.orm.public.Tournament
      .where({ id: params.id })
      .include('participants', (p) => p.where((pp) => pp.attendanceStatus.in(['CONFIRMED', 'ATTENDED'])).include('member', (m) => m).include('team', (t) => t))
      .include('teams', (t) => t.orderBy((tm) => tm.placement.asc()))
      .include('photos', (p) => p.orderBy((ph) => ph.createdAt.desc()))
      .first();
  } catch (e) {
    // A thrown query is not the same thing as "this tournament doesn't
    // exist" - conflating the two into notFound() hides real errors
    // behind a plain 404.
    console.error('DB error', e);
    dbError = true;
  }

  if (dbError) {
    throw new Error('Failed to load this tournament. Please try again shortly.');
  }

  if (!tournament) {
    notFound();
  }

  const isCompleted = tournament.status === 'COMPLETED';
  const isOngoing = tournament.status === 'ONGOING';
  const hasStandings = tournament.teams.length > 0 && (isCompleted || isOngoing || tournament.teams.some((t: any) => (t.totalPoints ?? 0) > 0 || t.placement !== null));

  // Show confirmed and attended players across all teams
  const rosterParticipants = tournament.participants.filter((p: any) =>
    p.attendanceStatus === 'CONFIRMED' || p.attendanceStatus === 'ATTENDED'
  );

  const teamGroups = new Map<string, any[]>();
  for (const team of tournament.teams) {
    teamGroups.set(team.name, []);
  }
  for (const p of rosterParticipants) {
    const key = p.team?.name ?? 'Unassigned';
    if (!teamGroups.has(key)) teamGroups.set(key, []);
    teamGroups.get(key)!.push(p);
  }

  const sortedTeams = [...tournament.teams].sort((a: any, b: any) => {
    if (a.placement && b.placement) return a.placement - b.placement;
    if (a.placement) return -1;
    if (b.placement) return 1;
    return (b.totalPoints ?? 0) - (a.totalPoints ?? 0);
  });

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
            {isOngoing ? (
              <span className="px-3.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-widest rounded-full self-start flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                LIVE / ONGOING
              </span>
            ) : isCompleted ? (
              <span className="px-3.5 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-mono font-bold uppercase tracking-widest rounded-full self-start flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">emoji_events</span> COMPLETED
              </span>
            ) : (
              <span className="px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest rounded-full self-start">
                {tournament.status}
              </span>
            )}
          </div>

          {/* Standings / Leaderboard */}
          {hasStandings && (
            <div className="flex flex-col gap-space-md mb-10">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">emoji_events</span>
                  {isCompleted ? 'Final Tournament Standings' : isOngoing ? 'Live Match Standings (Tournament In Progress)' : 'Current Standings'}
                </h2>
                {isOngoing && (
                  <span className="text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span> Updates each match day
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {sortedTeams.map((team: any, i: number) => {
                  const rank = team.placement ?? i + 1;
                  const isFirst = rank === 1;
                  const members = teamGroups.get(team.name) ?? [];
                  return (
                    <div
                      key={team.id}
                      className={`border rounded-xl p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isFirst
                          ? 'bg-primary-container/10 border-primary-container/40 shadow-[0_0_20px_rgba(255,59,59,0.1)]'
                          : 'bg-surface-container-low/80 border-surface-container-high'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-headline-md text-headline-md w-10 text-center font-bold ${
                            isFirst ? 'text-primary-container' : rank === 2 ? 'text-zinc-300' : rank === 3 ? 'text-amber-600' : 'text-outline'
                          }`}
                        >
                          #{rank}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-title-md text-on-surface font-bold text-base uppercase tracking-wide">{team.name}</p>
                            {isFirst && isCompleted && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-mono font-bold rounded uppercase">
                                🏆 Champions
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-outline font-mono mt-0.5">
                            {members.map((p: any) => p.member?.codmUsername).filter(Boolean).join(', ') || 'No roster recorded'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-auto font-mono">
                        {team.totalKills > 0 && (
                          <span className="text-xs text-outline px-2.5 py-1 bg-surface-container-high rounded border border-surface-container-high">
                            🎯 {team.totalKills} kills
                          </span>
                        )}
                        <span className="text-primary-container font-bold text-xl">
                          {team.totalPoints ?? 0} <span className="text-xs font-normal text-outline">pts</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Player Kills Leaderboard (Top Fraggers Table) */}
          {rosterParticipants.some((p: any) => (p.kills ?? 0) > 0) && (
            <div className="flex flex-col gap-space-md mb-10">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container">local_fire_department</span>
                  Top Players by Kills (Kill Leaderboard)
                </h2>
                <span className="text-xs font-mono text-outline uppercase">Individual Fraggers</span>
              </div>

              <div className="bg-surface-container-low/80 border border-surface-container-high rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-surface-container-highest/60 border-b border-surface-container-high text-[11px] font-mono uppercase tracking-wider text-outline font-bold">
                  <div className="col-span-2 sm:col-span-1">Rank</div>
                  <div className="col-span-5 sm:col-span-6">Player</div>
                  <div className="col-span-3">Squad</div>
                  <div className="col-span-2 text-right">Kills</div>
                </div>
                <div className="divide-y divide-surface-container-high/50">
                  {[...rosterParticipants]
                    .sort((a: any, b: any) => (b.kills ?? 0) - (a.kills ?? 0))
                    .map((p: any, idx: number) => {
                      const isTopFragger = idx === 0 && (p.kills ?? 0) > 0;
                      return (
                        <div
                          key={p.id}
                          className={`grid grid-cols-12 gap-2 px-4 py-3 items-center font-mono text-sm ${
                            isTopFragger ? 'bg-primary-container/10' : 'hover:bg-surface-container-high/30'
                          }`}
                        >
                          <div className="col-span-2 sm:col-span-1 font-bold">
                            <span className={isTopFragger ? 'text-primary-container' : idx === 1 ? 'text-zinc-300' : idx === 2 ? 'text-amber-600' : 'text-outline'}>
                              #{idx + 1}
                            </span>
                          </div>
                          <div className="col-span-5 sm:col-span-6 flex items-center gap-2 truncate">
                            <span className="text-on-surface font-bold truncate">{p.member?.codmUsername}</span>
                            {isTopFragger && (
                              <span className="hidden sm:inline-block px-1.5 py-0.5 bg-primary-container/20 text-primary-container border border-primary-container/40 text-[10px] rounded uppercase font-bold">
                                🔥 Top Fragger
                              </span>
                            )}
                          </div>
                          <div className="col-span-3 text-xs text-outline truncate uppercase">
                            {p.team?.name || 'Unassigned'}
                          </div>
                          <div className="col-span-2 text-right font-bold text-primary-container">
                            🎯 {p.kills ?? 0}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Confirmed Squads & Lineups */}
          <div className="flex flex-col gap-space-md">
            <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">groups</span>
              Confirmed Squads ({rosterParticipants.length} Players)
            </h2>
            {teamGroups.size === 0 ? (
              <p className="text-outline text-sm">No squad rosters recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {Array.from(teamGroups.entries()).map(([teamName, members]) => (
                  <div key={teamName} className="bg-surface-container-low/80 border border-surface-container-high rounded-xl p-space-md">
                    <p className="font-title-sm text-primary-container uppercase tracking-widest text-sm mb-3 font-bold">{teamName}</p>
                    {members.length === 0 ? (
                      <p className="text-xs text-outline font-mono">No players assigned yet</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {members.map((p: any) => (
                          <span key={p.id} className="px-2.5 py-1 bg-surface-container-highest border border-surface-container-high rounded font-mono text-xs text-on-surface flex items-center gap-1.5">
                            <span>
                              {p.member?.codmUsername}
                              {p.member?.codmClass ? ` (${p.member.codmClass})` : ''}
                            </span>
                            {(p.kills ?? 0) > 0 && (
                              <span className="text-[10px] text-primary-container font-bold bg-primary-container/10 px-1.5 py-0.5 rounded">
                                🎯 {p.kills}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {tournament.photos.length > 0 && (
            <div className="flex flex-col gap-space-md mt-space-lg">
              <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">photo_camera</span> Result Photos
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm">
                {tournament.photos.map((photo: any) => (
                  <div key={photo.id} className="bg-surface-container-low/80 border border-surface-container-high rounded-xl overflow-hidden">
                    <img src={photo.imageUrl} alt={photo.caption ?? tournament.name} className="w-full aspect-square object-cover" />
                    {photo.caption && (
                      <p className="text-xs text-outline px-space-sm py-2 truncate">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
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
