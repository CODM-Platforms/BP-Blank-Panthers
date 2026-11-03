'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createTournamentTeam,
  deleteTournamentTeam,
  assignPlayerToTeam,
  addMemberDirectlyToTeam,
  autoGenerateTournamentTeams,
  resetTournamentTeams,
} from '@/app/admin/tournaments/actions';

interface ParticipantData {
  id: string;
  memberId: string;
  attendanceStatus: string;
  teamId: string | null;
  seatNumber?: number | null;
  member: {
    id: string;
    fullName: string;
    codmUsername: string;
    preferredMode: string;
    codmClass?: string | null;
    profilePicture?: string | null;
  };
}

interface TeamData {
  id: string;
  name: string;
  placement?: number | null;
  totalPoints?: number | null;
  participants: ParticipantData[];
}

interface ClanMemberOption {
  id: string;
  fullName: string;
  codmUsername: string;
  preferredMode: string;
  codmClass?: string | null;
}

interface Props {
  tournament: {
    id: string;
    name: string;
    mode: string;
    teamSize: number;
    maxPlayers: number;
    status: string;
  };
  teams: TeamData[];
  unassignedParticipants: ParticipantData[];
  activeClanMembers: ClanMemberOption[];
}

const PRESET_TEAMS = ['TEAM ALPHA', 'TEAM BETA', 'TEAM GAMMA', 'TEAM DELTA'];

export default function TeamBuilderClient({
  tournament,
  teams,
  unassignedParticipants,
  activeClanMembers,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTeamName, setNewTeamName] = useState('');
  const [searchUnassigned, setSearchUnassigned] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Already assigned member IDs across all teams in this tournament
  const assignedMemberIds = new Set(
    teams.flatMap((t) => t.participants.map((p) => p.memberId))
  );

  // Unassigned active clan members who aren't in any squad yet
  const availableClanMembers = activeClanMembers.filter(
    (m) => !assignedMemberIds.has(m.id)
  );

  const filteredUnassigned = unassignedParticipants.filter((p) => {
    const q = searchUnassigned.trim().toLowerCase();
    if (!q) return true;
    return (
      p.member.codmUsername.toLowerCase().includes(q) ||
      p.member.fullName.toLowerCase().includes(q) ||
      (p.member.codmClass && p.member.codmClass.toLowerCase().includes(q))
    );
  });

  const handleCreateTeam = (nameToCreate?: string) => {
    const targetName = (nameToCreate || newTeamName).trim();
    if (!targetName) return;

    setErrorMsg('');
    startTransition(async () => {
      try {
        await createTournamentTeam(tournament.id, targetName);
        setNewTeamName('');
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to create team.');
      }
    });
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete squad "${teamName}"? Players will be moved back to unassigned.`)) {
      return;
    }
    setErrorMsg('');
    startTransition(async () => {
      try {
        await deleteTournamentTeam(teamId, tournament.id);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to delete team.');
      }
    });
  };

  const handleAssignPlayer = (participantId: string, teamId: string | null) => {
    setErrorMsg('');
    startTransition(async () => {
      try {
        await assignPlayerToTeam(participantId, teamId, tournament.id);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to assign player.');
      }
    });
  };

  const handleAddMemberDirectly = (memberId: string, teamId: string) => {
    if (!memberId) return;
    setErrorMsg('');
    startTransition(async () => {
      try {
        await addMemberDirectlyToTeam(tournament.id, memberId, teamId);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to add member to team.');
      }
    });
  };

  const handleAutoGenerate = () => {
    if (unassignedParticipants.length === 0) {
      setErrorMsg('No unassigned tournament participants available to auto-generate squads.');
      return;
    }
    setErrorMsg('');
    startTransition(async () => {
      try {
        await autoGenerateTournamentTeams(tournament.id);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Auto-generation failed.');
      }
    });
  };

  const handleResetTeams = () => {
    if (!confirm('Are you sure you want to clear all teams and move everyone to unassigned?')) {
      return;
    }
    setErrorMsg('');
    startTransition(async () => {
      try {
        await resetTournamentTeams(tournament.id);
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to reset teams.');
      }
    });
  };

  const totalAssignedPlayers = teams.reduce((acc, t) => acc + t.participants.length, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link
            href={`/admin/tournaments/${tournament.id}`}
            className="text-sm text-outline hover:text-primary-container mb-2 inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Tournament
          </Link>
          <h1 className="text-3xl font-bold text-on-surface uppercase tracking-tight">Team Builder</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-outline">
            <span className="text-on-surface font-bold">{tournament.name}</span>
            <span>•</span>
            <span className="text-primary-container">{tournament.mode} ({tournament.teamSize}v{tournament.teamSize})</span>
            <span>•</span>
            <span>Squads: {teams.length}</span>
            <span>•</span>
            <span>Players Assigned: {totalAssignedPlayers}/{tournament.maxPlayers}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isPending || unassignedParticipants.length === 0}
            onClick={handleAutoGenerate}
            className="px-4 py-2 bg-surface-container-high border border-surface-container-high hover:border-primary-container text-on-surface rounded-lg text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px] text-primary-container">auto_awesome</span>
            <span>Auto-Generate Squads</span>
          </button>

          {teams.length > 0 && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleResetTeams}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Clear All Squads</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-bold flex items-center justify-between">
          <span>⚠ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-xs uppercase hover:underline">Dismiss</button>
        </div>
      )}

      {/* Quick Create Squad Bar */}
      <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateTeam();
          }}
          className="flex items-center gap-2 flex-1 max-w-lg"
        >
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Squad Name (e.g. TEAM ALPHA, SQUAD 1)..."
            className="flex-1 h-10 bg-surface-container-lowest border border-surface-container-high rounded-lg px-3 text-sm text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary-container font-bold"
          />
          <button
            type="submit"
            disabled={isPending || !newTeamName.trim()}
            className="px-4 h-10 bg-primary-container text-surface-container-lowest rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-primary-fixed-dim transition-colors disabled:opacity-40 shrink-0 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add Squad
          </button>
        </form>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-outline uppercase font-mono text-[11px] mr-1">Quick Presets:</span>
          {PRESET_TEAMS.map((preset) => {
            const alreadyExists = teams.some((t) => t.name.toLowerCase() === preset.toLowerCase());
            return (
              <button
                key={preset}
                type="button"
                disabled={isPending || alreadyExists}
                onClick={() => handleCreateTeam(preset)}
                className={`px-2.5 py-1 rounded font-mono text-[11px] border transition-colors ${
                  alreadyExists
                    ? 'border-surface-container-high text-outline/40 line-through cursor-not-allowed'
                    : 'border-primary-container/30 bg-primary-container/10 text-primary-container hover:bg-primary-container hover:text-surface-container-lowest'
                }`}
              >
                + {preset}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* LEFT COLUMN: Unassigned Players Pool */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-5 sticky top-20 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-surface-container-high/60 pb-3">
            <h2 className="font-bold text-on-surface uppercase text-sm tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">person_off</span>
              Unassigned Pool
            </h2>
            <span className="px-2 py-0.5 bg-surface-container-lowest rounded text-xs font-mono text-primary-container border border-surface-container-high">
              {unassignedParticipants.length}
            </span>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined text-[16px] text-outline absolute left-2.5 top-2.5 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchUnassigned}
              onChange={(e) => setSearchUnassigned(e.target.value)}
              placeholder="Filter players..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-surface-container-lowest border border-surface-container-high rounded-lg text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary-container"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredUnassigned.length === 0 ? (
              <p className="text-xs text-outline italic text-center py-6">
                {unassignedParticipants.length === 0
                  ? 'All tournament participants are assigned to squads.'
                  : 'No players match your search filter.'}
              </p>
            ) : (
              filteredUnassigned.map((p) => (
                <div
                  key={p.id}
                  className="p-2.5 bg-surface-container-lowest border border-surface-container-high rounded-lg hover:border-primary-container/40 transition-colors flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-on-surface font-mono truncate">
                      {p.member.codmUsername}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-highest text-primary-container shrink-0">
                      {p.member.preferredMode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-outline">
                    <span className="truncate">{p.member.fullName}</span>
                    {p.member.codmClass && (
                      <span className="text-[10px] text-outline/80 font-mono truncate">
                        {p.member.codmClass}
                      </span>
                    )}
                  </div>

                  {teams.length > 0 && (
                    <div className="mt-1 pt-1.5 border-t border-surface-container-high/40 flex items-center gap-1.5">
                      <span className="text-[10px] text-outline uppercase font-mono">Move to:</span>
                      <select
                        disabled={isPending}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignPlayer(p.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1 h-6 bg-surface-container border border-surface-container-high rounded text-[11px] text-on-surface px-1 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>
                          Select Squad...
                        </option>
                        {teams.map((t) => (
                          <option
                            key={t.id}
                            value={t.id}
                            disabled={t.participants.length >= tournament.teamSize}
                          >
                            {t.name} ({t.participants.length}/{tournament.teamSize})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Squads Grid */}
        <div className="lg:col-span-3 space-y-6">
          {teams.length === 0 ? (
            <div className="p-12 text-center border-2 border-surface-container-high border-dashed rounded-xl bg-surface-container-low/40 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-[48px] text-outline">groups</span>
              <h3 className="font-bold text-lg text-on-surface uppercase">No Squads Created Yet</h3>
              <p className="text-sm text-outline max-w-md">
                Click one of the quick presets above (like <strong>+ TEAM ALPHA</strong>) or type a squad name to start building teams for {tournament.name}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team) => {
                const isFull = team.participants.length >= tournament.teamSize;
                const emptySlotsCount = Math.max(0, tournament.teamSize - team.participants.length);

                return (
                  <div
                    key={team.id}
                    className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden shadow-lg flex flex-col relative"
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-60"></div>

                    {/* Squad Header */}
                    <div className="p-4 bg-surface-container-lowest/80 border-b border-surface-container-high flex justify-between items-center gap-3">
                      <div>
                        <h3 className="font-bold text-on-surface text-base uppercase tracking-wider font-mono">
                          {team.name}
                        </h3>
                        <span className="text-[10px] text-outline uppercase font-mono">
                          {tournament.mode} Squad
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                            isFull
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : 'bg-primary-container/10 text-primary-container border-primary-container/30'
                          }`}
                        >
                          {team.participants.length}/{tournament.teamSize} {isFull ? 'FULL' : 'OPS'}
                        </span>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          title="Delete squad"
                          className="p-1 text-outline hover:text-error transition-colors rounded hover:bg-surface-container-highest"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Squad Roster Slots */}
                    <div className="p-4 space-y-2.5 flex-1 flex flex-col">
                      {/* Filled Slots */}
                      {team.participants.map((p, seat) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2.5 bg-surface-container-lowest border border-surface-container-high rounded-lg hover:border-primary-container/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-6 h-6 rounded bg-surface-container-high border border-surface-container-high text-primary-container text-xs font-mono flex items-center justify-center font-bold shrink-0">
                              {seat + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-on-surface font-mono truncate">
                                {p.member.codmUsername}
                              </p>
                              <p className="text-[10px] text-outline truncate">{p.member.fullName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {p.member.codmClass && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant hidden sm:inline-block">
                                {p.member.codmClass}
                              </span>
                            )}
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleAssignPlayer(p.id, null)}
                              title="Remove from squad"
                              className="w-6 h-6 rounded flex items-center justify-center text-outline hover:text-error hover:bg-surface-container-high transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Empty Slots & Add Player Picker */}
                      {Array.from({ length: emptySlotsCount }).map((_, i) => {
                        const slotNum = team.participants.length + i + 1;
                        return (
                          <div
                            key={`empty-${slotNum}`}
                            className="p-2.5 bg-surface-container-lowest/30 border border-surface-container-high border-dashed rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 min-h-[48px]"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-surface-container border border-surface-container-high/50 text-outline/50 text-xs font-mono flex items-center justify-center shrink-0">
                                {slotNum}
                              </div>
                              <span className="text-xs text-outline italic">Empty Slot</span>
                            </div>

                            {/* Dropdown to fill this empty slot */}
                            <div className="flex items-center gap-1">
                              <select
                                disabled={isPending}
                                defaultValue=""
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (!val) return;
                                  if (val.startsWith('p:')) {
                                    handleAssignPlayer(val.slice(2), team.id);
                                  } else if (val.startsWith('m:')) {
                                    handleAddMemberDirectly(val.slice(2), team.id);
                                  }
                                  e.target.value = '';
                                }}
                                className="w-full sm:w-44 h-7 bg-surface-container border border-surface-container-high rounded text-[11px] text-on-surface px-2 focus:outline-none focus:border-primary-container cursor-pointer"
                              >
                                <option value="" disabled>
                                  + Assign Player...
                                </option>

                                {unassignedParticipants.length > 0 && (
                                  <optgroup label="Tournament Participants">
                                    {unassignedParticipants.map((p) => (
                                      <option key={p.id} value={`p:${p.id}`}>
                                        {p.member.codmUsername} ({p.member.preferredMode})
                                      </option>
                                    ))}
                                  </optgroup>
                                )}

                                {availableClanMembers.length > 0 && (
                                  <optgroup label="Other Clan Members">
                                    {availableClanMembers.map((m) => (
                                      <option key={m.id} value={`m:${m.id}`}>
                                        {m.codmUsername} ({m.fullName})
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
