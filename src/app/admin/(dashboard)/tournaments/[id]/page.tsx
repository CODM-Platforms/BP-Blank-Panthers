import { Users, ShieldCheck, Download, Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/prisma/db';
import { toJsDate, sanitizeForClient } from '@/lib/temporal';
import { getBaseUrl } from '@/lib/url';
import { publishTournament, cancelTournament, inviteMembersToTournament, saveResultsAndComplete, autoProgressAttendance } from '@/app/admin/tournaments/actions';
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

      {/* Enter Results */}
      {tournament.teams.length > 0 && tournament.status !== 'COMPLETED' && tournament.status !== 'CANCELLED' && (
        <form action={doSaveResults} className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">emoji_events</span> Enter Results
          </h2>
          <p className="text-sm text-outline mb-4">Set final placement and points for each squad, then save to mark this tournament Completed. This is what shows on the public results page.</p>
          <div className="space-y-3 mb-4">
            {tournament.teams.map((team: any) => (
              <div key={team.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-surface-container-lowest border border-surface-container-high rounded-lg p-3">
                <span className="text-on-surface font-bold truncate">{team.name}</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-outline uppercase shrink-0">Placement</label>
                  <input type="number" name={`placement_${team.id}`} min={1} defaultValue={team.placement ?? ''} placeholder="1st, 2nd..." className="w-full bg-surface-container-high border border-surface-container-high rounded px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary-container" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-outline uppercase shrink-0">Points</label>
                  <input type="number" name={`points_${team.id}`} min={0} defaultValue={team.totalPoints ?? 0} className="w-full bg-surface-container-high border border-surface-container-high rounded px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary-container" />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="px-6 py-2 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors">
            Save Results &amp; Mark Completed
          </button>
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
