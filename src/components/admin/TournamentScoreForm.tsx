'use client';

import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { saveResultsAndComplete } from '@/app/admin/tournaments/actions';

interface TournamentScoreFormProps {
  tournamentId: string;
  tournamentStatus: string;
  teams: any[];
  participants: any[];
}

export default function TournamentScoreForm({
  tournamentId,
  tournamentStatus,
  teams,
  participants,
}: TournamentScoreFormProps) {
  const [manualEditUnlocked, setManualEditUnlocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await saveResultsAndComplete(tournamentId, formData);
      setSaveMessage('Scores & rankings updated successfully!');
      setTimeout(() => setSaveMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }

  // Generate a key from current totals so inputs refresh with latest server totals and clear "+ Today" boxes after save
  const totalsVersionKey =
    teams.map((t: any) => `${t.id}:${t.totalPoints ?? 0}:${t.totalKills ?? 0}:${t.placement ?? 0}`).join('|') +
    '__' +
    participants.map((p: any) => `${p.id}:${p.kills ?? 0}`).join('|');

  return (
    <form
      key={totalsVersionKey}
      action={handleSubmit}
      className="bg-surface-container-low border border-surface-container-high rounded-xl p-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container">emoji_events</span> Match Scores &amp; Player Kills
          </h2>
          <p className="text-sm text-outline mt-1">
            Only type in <b>+ Today Kills</b> and <b>+ Win / Bonus Pts (Today)</b>. Totals and Squad Ranks (#1–#4) calculate automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setManualEditUnlocked((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
              manualEditUnlocked
                ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/25'
                : 'bg-surface-container-high/60 border-surface-container-high text-outline hover:text-on-surface hover:border-outline/40'
            }`}
            title={
              manualEditUnlocked
                ? 'Click to lock automatic total fields'
                : 'Unlock only if you need to manually fix a past total'
            }
          >
            {manualEditUnlocked ? (
              <>
                <Unlock className="w-3.5 h-3.5" /> Manual Edit Unlocked
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" /> Totals Locked (Auto)
              </>
            )}
          </button>

          <span
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              tournamentStatus === 'COMPLETED'
                ? 'bg-primary-container/10 border border-primary-container/30 text-primary-container'
                : 'bg-green-500/10 border border-green-500/30 text-green-400'
            }`}
          >
            {tournamentStatus === 'ONGOING' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>}
            Status: {tournamentStatus}
          </span>
        </div>
      </div>

      {manualEditUnlocked && (
        <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-mono flex items-center justify-between gap-2">
          <span>
            ⚠️ <b>Manual Correction Mode Active:</b> You can now edit <b>Team Total Points</b>, <b>Team Kills</b>, and <b>Player Total Kills</b> directly to fix any past mistake.
          </span>
          <button
            type="button"
            onClick={() => setManualEditUnlocked(false)}
            className="underline font-bold shrink-0 hover:text-yellow-200"
          >
            Lock Again
          </button>
        </div>
      )}

      <div className="space-y-4 mb-6">
        {teams.map((team: any) => {
          const teamMembers = participants.filter((p: any) => p.teamId === team.id);
          const squadPlayerKillsSum = teamMembers.reduce((sum: number, p: any) => sum + (p.kills ?? 0), 0);
          return (
            <div
              key={team.id}
              className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-4 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high pb-3">
                <div>
                  <span className="text-on-surface font-bold text-base uppercase tracking-wide">{team.name}</span>
                  <p className="text-xs text-outline font-mono mt-0.5">
                    Squad: {teamMembers.map((p: any) => p.member?.codmUsername).filter(Boolean).join(', ') || 'No players assigned'}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-0.5 bg-surface-container-high text-outline font-mono text-xs rounded">
                    🎯 Squad Kills: {squadPlayerKillsSum > 0 ? squadPlayerKillsSum : (team.totalKills ?? 0)}
                  </span>
                  {team.placement && (
                    <span className="px-2.5 py-0.5 bg-primary-container/15 text-primary-container border border-primary-container/30 font-mono text-xs rounded font-bold">
                      Rank #{team.placement}
                    </span>
                  )}
                </div>
              </div>

              {/* Team Points & Rank Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-outline uppercase block mb-1 flex items-center justify-between">
                    <span>Team Total Points</span>
                    {!manualEditUnlocked && <span className="text-[10px] text-outline/60 font-mono">🔒 Auto</span>}
                  </label>
                  <input
                    type="number"
                    name={`points_${team.id}`}
                    min={0}
                    readOnly={!manualEditUnlocked}
                    tabIndex={manualEditUnlocked ? 0 : -1}
                    defaultValue={team.totalPoints ?? 0}
                    className={`w-full rounded px-3 py-2 text-sm font-mono transition-colors ${
                      manualEditUnlocked
                        ? 'bg-surface-container-high border border-yellow-500/50 text-on-surface focus:outline-none focus:border-yellow-400'
                        : 'bg-surface-container-high/30 border border-surface-container-high/60 text-outline cursor-not-allowed select-none focus:outline-none'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs text-primary-container font-bold uppercase block mb-1">
                    + Win / Bonus Pts (Today)
                  </label>
                  <input
                    type="number"
                    name={`add_points_${team.id}`}
                    placeholder="+0 (Win: 3, 2nd: 1)"
                    className="w-full bg-surface-container-high/80 border border-primary-container/40 rounded px-3 py-2 text-primary-container placeholder-outline/50 text-sm font-mono focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="text-xs text-outline uppercase block mb-1 flex items-center justify-between">
                    <span>Team Kills (Auto-Summed)</span>
                    {!manualEditUnlocked && <span className="text-[10px] text-outline/60 font-mono">🔒 Auto</span>}
                  </label>
                  <input
                    type="number"
                    name={`kills_${team.id}`}
                    min={0}
                    readOnly={!manualEditUnlocked}
                    tabIndex={manualEditUnlocked ? 0 : -1}
                    defaultValue={squadPlayerKillsSum > 0 ? squadPlayerKillsSum : (team.totalKills ?? 0)}
                    className={`w-full rounded px-3 py-2 text-sm font-mono transition-colors ${
                      manualEditUnlocked
                        ? 'bg-surface-container-high border border-yellow-500/50 text-on-surface focus:outline-none focus:border-yellow-400'
                        : 'bg-surface-container-high/30 border border-surface-container-high/60 text-outline cursor-not-allowed select-none focus:outline-none'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs text-outline uppercase block mb-1 flex items-center justify-between">
                    <span>Placement / Rank</span>
                    <span className="text-[10px] text-outline/60 font-mono">🔒 Auto</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    value={team.placement ? `#${team.placement} (Auto by Points)` : 'Auto by Points'}
                    className="w-full bg-surface-container-high/30 border border-surface-container-high/60 rounded px-3 py-2 text-outline text-sm font-mono cursor-not-allowed select-none focus:outline-none"
                  />
                </div>
              </div>

              {/* Individual Player Kills Table for this Squad */}
              {teamMembers.length > 0 && (
                <div className="bg-surface-container-low/60 border border-surface-container-high/80 rounded-lg p-3">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-primary-container font-bold mb-2.5 flex items-center gap-1.5">
                    🎯 Player Kills — {team.name}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {teamMembers.map((p: any) => (
                      <div
                        key={p.id}
                        className="bg-surface-container-lowest border border-surface-container-high rounded-md p-2.5 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-on-surface truncate">
                            {p.member?.codmUsername || p.member?.fullName}
                          </span>
                          <span className="text-[10px] font-mono text-primary-container bg-primary-container/10 px-1.5 py-0.5 rounded">
                            {p.kills ?? 0} kills
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-outline uppercase block mb-0.5 flex items-center justify-between">
                              <span>Total Kills</span>
                              {!manualEditUnlocked && <span className="text-[9px] text-outline/60 font-mono">🔒</span>}
                            </label>
                            <input
                              type="number"
                              name={`player_kills_${p.id}`}
                              min={0}
                              readOnly={!manualEditUnlocked}
                              tabIndex={manualEditUnlocked ? 0 : -1}
                              defaultValue={p.kills ?? 0}
                              className={`w-full rounded px-2 py-1.5 text-xs font-mono transition-colors ${
                                manualEditUnlocked
                                  ? 'bg-surface-container-high border border-yellow-500/50 text-on-surface focus:outline-none focus:border-yellow-400'
                                  : 'bg-surface-container-high/30 border border-surface-container-high/60 text-outline cursor-not-allowed select-none focus:outline-none'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-primary-container font-bold uppercase block mb-0.5">
                              + Today Kills
                            </label>
                            <input
                              type="number"
                              name={`add_player_kills_${p.id}`}
                              placeholder="+0"
                              className="w-full bg-surface-container-high/80 border border-primary-container/40 rounded px-2 py-1.5 text-primary-container placeholder-outline/50 text-xs font-mono focus:outline-none focus:border-primary-container"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Top Players by Kills Preview */}
      {participants.some((p: any) => (p.kills ?? 0) > 0) && (
        <div className="mb-6 bg-surface-container-lowest border border-surface-container-high rounded-lg p-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-primary-container font-bold mb-3 flex items-center gap-2">
            🔥 Current Top Players by Kills (Live Preview)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {[...participants]
              .filter((p: any) => p.teamId || (p.kills ?? 0) > 0)
              .sort((a: any, b: any) => (b.kills ?? 0) - (a.kills ?? 0))
              .map((p: any, idx: number) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 bg-surface-container-low border border-surface-container-high rounded text-xs font-mono"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={idx === 0 ? 'text-primary-container font-bold' : 'text-outline'}>#{idx + 1}</span>
                    <span className="text-on-surface font-bold truncate">{p.member?.codmUsername}</span>
                    <span className="text-[10px] text-outline truncate">({p.team?.name || 'No Team'})</span>
                  </div>
                  <span className="text-primary-container font-bold shrink-0">{p.kills ?? 0} 🎯</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-mono font-bold">
          ✅ {saveMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-surface-container-high">
        <p className="text-xs text-outline">
          💡 <b>Match Day Tip:</b> Click <b>Save Scores (Keep Ongoing)</b> so today&apos;s team points and player kills update on the live leaderboard while keeping the tournament open for the next match day.
        </p>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="submit"
            name="status_action"
            value="ongoing"
            disabled={isSaving}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,59,59,0.2)] disabled:opacity-50"
          >
            💾 {isSaving ? 'Saving...' : 'Save Scores (Keep Ongoing)'}
          </button>
          <button
            type="submit"
            name="status_action"
            value="completed"
            disabled={isSaving}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-surface-container-high hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            🏆 Finalize &amp; Complete
          </button>
        </div>
      </div>
    </form>
  );
}

