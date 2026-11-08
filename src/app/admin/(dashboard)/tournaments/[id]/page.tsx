import { Users, ShieldCheck, Download, Pencil, Play } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/prisma/db';
import { toJsDate, sanitizeForClient } from '@/lib/temporal';
import { getBaseUrl } from '@/lib/url';
import { publishTournament, cancelTournament, inviteMembersToTournament, saveResultsAndComplete, autoProgressAttendance, setTournamentStatus } from '@/app/admin/tournaments/actions';
import TournamentParticipants from '@/components/admin/TournamentParticipants';
import TournamentPhotos from '@/components/admin/TournamentPhotos';
import DeleteTournamentButton from '@/components/admin/DeleteTournamentButton';

export default async function TournamentControlCenter({ params }: { params: { id: string } }) {
  let tournament = null;
  let invitableMembers: any[] = [];
  let dbError: string | null = null;
  try {
    // Promote any still-CONFIRMED participants to ATTENDED once the
    // tournament's start time has passed, before reading the roster below.
    await autoProgressAttendance(params.id);

    tournament = await db.orm.public.Tournament
      .where({ id: params.id })
      .include('participants', (p) => p.include('member', (m) => m).include('team', (t) => t))
      .include('teams', (t) => t)
      .include('photos', (p) => p.orderBy((ph) => ph.createdAt.desc()))
      .first();

    if (tournament) {
      const invitedIds = new Set(tournament.participants.map((p: any) => p.memberId));
      const activeMembers = await db.orm.public.Member.where({ status: 'ACTIVE' }).all();
      invitableMembers = activeMembers.filter((m) => !invitedIds.has(m.id));
    }
  } catch (e) {
    console.error('DB error', e);
    // A thrown query (e.g. a table the DB migration hasn't been applied
    // for yet) is not the same thing as "this tournament doesn't exist" -
    // conflating the two into notFound() hides real errors as a plain 404.
    dbError = e instanceof Error ? e.message : String(e);
  }

  if (dbError) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
        <p className="font-bold mb-1">Failed to load this tournament.</p>
        <p className="text-sm font-mono">{dbError}</p>
      </div>
    );
  }

  if (!tournament) {
    notFound();
  }

  const participants = tournament.participants;
  const confirmed = participants.filter((p: any) => p.attendanceStatus === 'CONFIRMED').length;
  const declined = participants.filter((p: any) => p.attendanceStatus === 'DECLINED').length;
  const pending = participants.filter((p: any) => p.attendanceStatus === 'PENDING').length;
  const requiredSquads = Math.ceil(confirmed / tournament.teamSize) || 0;
  const tournamentDateStr = toJsDate(tournament.tournamentDate).toLocaleDateString();
  const scheduleStr = tournament.tournamentEnd
    ? `${toJsDate(tournament.tournamentDate).toLocaleString()} → ${toJsDate(tournament.tournamentEnd).toLocaleString()}`
    : tournamentDateStr;

  const doPublish = publishTournament.bind(null, tournament.id);
  const doCancel = cancelTournament.bind(null, tournament.id);
  const doInvite = inviteMembersToTournament.bind(null, tournament.id);
  const doSaveResults = saveResultsAndComplete.bind(null, tournament.id);

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
            <span>{scheduleStr}</span>
            <span>•</span>
            <span className="uppercase">{tournament.status}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <a href={`/api/admin/tournaments/${tournament.id}/export`} className="px-4 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface hover:border-primary-container hover:text-primary-container transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Roster
          </a>
          <Link href={`/admin/tournaments/${tournament.id}/teams`} className="px-4 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface hover:border-primary-container hover:text-primary-container transition-colors flex items-center gap-2">
            <Users className="w-4 h-4" /> Team Builder
          </Link>
          <Link href={`/admin/tournaments/${tournament.id}/edit`} className="px-4 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface hover:border-primary-container hover:text-primary-container transition-colors flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <DeleteTournamentButton tournamentId={tournament.id} tournamentName={tournament.name} />
          {tournament.status === 'DRAFT' && (
            <form action={doPublish}>
              <button type="submit" className="px-4 py-2 bg-primary-container text-surface-container-lowest rounded-lg font-bold hover:bg-primary-fixed-dim transition-colors flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Publish
              </button>
            </form>
          )}
          {tournament.status === 'PUBLISHED' && (
            <form action={async () => {
              'use server';
              await setTournamentStatus(tournament.id, 'ONGOING');
            }}>
              <button type="submit" className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg font-bold hover:bg-green-500/20 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" /> Start (Set Ongoing)
              </button>
            </form>
          )}
          {tournament.status === 'COMPLETED' && (
            <form action={async () => {
              'use server';
              await setTournamentStatus(tournament.id, 'ONGOING');
            }}>
              <button type="submit" className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg font-bold hover:bg-green-500/20 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" /> Reopen as Ongoing
              </button>
            </form>
          )}
          {tournament.status === 'ONGOING' && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-bold text-xs uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Ongoing / Live Matches
            </div>
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

      {/* Invite Members */}
      {invitableMembers.length > 0 && (
        <form action={doInvite} className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-container" /> Invite Members
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto mb-4">
            {invitableMembers.map((m) => (
              <label key={m.id} className="flex items-center gap-2 px-3 py-2 bg-surface-container-lowest border border-surface-container-high rounded-lg cursor-pointer hover:border-primary-container/50 transition-colors">
                <input type="checkbox" name="memberIds" value={m.id} className="accent-primary-container" />
                <span className="text-sm text-on-surface truncate">{m.fullName}</span>
              </label>
            ))}
          </div>
          <button type="submit" className="px-6 py-2 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors">
            Invite Selected
          </button>
        </form>
      )}

      {/* Match Scores & Daily Standings */}
      {tournament.teams.length > 0 && tournament.status !== 'CANCELLED' && (
        <form action={doSaveResults} className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">emoji_events</span> Match Scores &amp; Standings
              </h2>
              <p className="text-sm text-outline mt-1">
                Enter or update marks after each match day. Totals and placements will update automatically on the leaderboard.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                tournament.status === 'COMPLETED'
                  ? 'bg-primary-container/10 border border-primary-container/30 text-primary-container'
                  : 'bg-green-500/10 border border-green-500/30 text-green-400'
              }`}>
                {tournament.status === 'ONGOING' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
                Status: {tournament.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {tournament.teams.map((team: any) => {
              const teamMembers = (tournament.participants ?? []).filter((p: any) => p.teamId === team.id);
              return (
                <div key={team.id} className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high pb-2">
                    <div>
                      <span className="text-on-surface font-bold text-base uppercase tracking-wide">{team.name}</span>
                      <p className="text-xs text-outline font-mono mt-0.5">
                        Squad: {teamMembers.map((p: any) => p.member?.codmUsername).filter(Boolean).join(', ') || 'No players assigned'}
                      </p>
                    </div>
                    {team.placement && (
                      <span className="px-2 py-0.5 bg-surface-container-high text-primary-container font-mono text-xs rounded font-bold self-start sm:self-auto">
                        Rank #{team.placement}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-outline uppercase block mb-1">Total Points</label>
                      <input
                        type="number"
                        name={`points_${team.id}`}
                        min={0}
                        defaultValue={team.totalPoints ?? 0}
                        className="w-full bg-surface-container-high border border-surface-container-high rounded px-3 py-2 text-on-surface text-sm font-mono focus:outline-none focus:border-primary-container"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-outline uppercase block mb-1">+ Add Points (Today)</label>
                      <input
                        type="number"
                        name={`add_points_${team.id}`}
                        placeholder="+0"
                        className="w-full bg-surface-container-high/60 border border-surface-container-high rounded px-3 py-2 text-primary-container placeholder-outline/50 text-sm font-mono focus:outline-none focus:border-primary-container"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-outline uppercase block mb-1">Total Kills</label>
                      <input
                        type="number"
                        name={`kills_${team.id}`}
                        min={0}
                        defaultValue={team.totalKills ?? 0}
                        className="w-full bg-surface-container-high border border-surface-container-high rounded px-3 py-2 text-on-surface text-sm font-mono focus:outline-none focus:border-primary-container"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-outline uppercase block mb-1">Placement / Rank</label>
                      <input
                        type="number"
                        name={`placement_${team.id}`}
                        min={1}
                        defaultValue={team.placement ?? ''}
                        placeholder="Auto (or 1, 2...)"
                        className="w-full bg-surface-container-high border border-surface-container-high rounded px-3 py-2 text-on-surface text-sm font-mono focus:outline-none focus:border-primary-container"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-surface-container-high">
            <p className="text-xs text-outline">
              💡 <b>Match Day Tip:</b> Click <b>Save Scores (Keep Ongoing)</b> so today&apos;s scores update on the live standings while the tournament remains open for the next match day.
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                name="status_action"
                value="ongoing"
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,59,59,0.2)]"
              >
                💾 Save Scores (Keep Ongoing)
              </button>
              <button
                type="submit"
                name="status_action"
                value="completed"
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-surface-container-high hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                🏆 Finalize &amp; Complete
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Result Photos */}
      <TournamentPhotos tournamentId={tournament.id} photos={sanitizeForClient(tournament.photos)} />

      {/* Participants Table */}
      <TournamentParticipants
        participants={sanitizeForClient(participants)}
        tournamentName={tournament.name}
        tournamentDate={tournamentDateStr}
        appUrl={getBaseUrl()}
      />
    </div>
  );
}
