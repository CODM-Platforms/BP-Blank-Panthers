'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

interface RosterMember {
  id: string;
  fullName: string;
  codmUsername: string;
  preferredMode: string;
  codmClass?: string | null;
  region: string;
  country: string;
  tournamentsAttended: number;
  profilePicture?: string | null;
}

const MODE_FILTERS = ['ALL', 'BR', 'MP', 'Both'] as const;
type ModeFilter = (typeof MODE_FILTERS)[number];

export default function RosterClient({ members }: { members: RosterMember[] }) {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (modeFilter !== 'ALL' && m.preferredMode.toLowerCase() !== modeFilter.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      return (
        m.codmUsername.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        (m.codmClass && m.codmClass.toLowerCase().includes(q)) ||
        m.region.toLowerCase().includes(q)
      );
    });
  }, [members, search, modeFilter]);

  return (
    <div className="flex flex-col gap-space-md">
      {/* Search, Mode Filter & View Toggle Bar */}
      <div className="bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl p-space-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, name, class, or region..."
            className="w-full h-10 bg-surface-container-lowest border border-surface-container-high rounded-lg pl-9 pr-4 text-sm text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary-container transition-colors"
          />
        </div>

        {/* Mode Filters + View Switcher */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high">
            {MODE_FILTERS.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setModeFilter(mode)}
                className={
                  modeFilter === mode
                    ? 'px-3 py-1 rounded-md bg-primary-container text-on-primary-container font-label-sm text-xs uppercase tracking-wider transition-colors'
                    : 'px-3 py-1 rounded-md text-outline hover:text-on-surface font-label-sm text-xs uppercase tracking-wider transition-colors'
                }
              >
                {mode === 'ALL' ? `All (${members.length})` : mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg border border-surface-container-high">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Compact Grid View"
              className={
                viewMode === 'grid'
                  ? 'p-1.5 rounded bg-surface-container-highest text-primary-container transition-colors flex items-center justify-center'
                  : 'p-1.5 rounded text-outline hover:text-on-surface transition-colors flex items-center justify-center'
              }
            >
              <span className="material-symbols-outlined text-[18px]">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Compact List View"
              className={
                viewMode === 'list'
                  ? 'p-1.5 rounded bg-surface-container-highest text-primary-container transition-colors flex items-center justify-center'
                  : 'p-1.5 rounded text-outline hover:text-on-surface transition-colors flex items-center justify-center'
              }
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      {filteredMembers.length === 0 ? (
        <div className="p-8 text-center border border-surface-container-high border-dashed rounded-xl text-outline font-mono text-sm">
          {members.length === 0 ? 'No active clan members found yet.' : 'No members match your search or filter.'}
        </div>
      ) : viewMode === 'grid' ? (
        /* COMPACT HORIZONTAL CARDS (3 columns on desktop, fits many members cleanly) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-sm">
          {filteredMembers.map((member) => (
            <Link
              href={`/player/${encodeURIComponent(member.codmUsername)}`}
              key={member.id}
              className="bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl p-3.5 hover:border-primary-container/50 transition-all hover:-translate-y-0.5 group flex items-center gap-3.5"
            >
              {/* Compact Avatar */}
              <div className="w-14 h-14 rounded-xl bg-surface-container-lowest border border-surface-container-high group-hover:border-primary-container/40 flex items-center justify-center overflow-hidden shrink-0">
                {member.profilePicture ? (
                  <img
                    src={member.profilePicture}
                    alt={member.codmUsername}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[28px] text-outline group-hover:text-primary-container transition-colors">
                    person
                  </span>
                )}
              </div>

              {/* Member Info */}
              <div className="min-w-0 flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-title-md text-on-surface font-bold truncate group-hover:text-primary-container transition-colors">
                    {member.codmUsername}
                  </h3>
                  <span className="shrink-0 px-2 py-0.5 rounded bg-surface-container-highest border border-surface-container-high font-mono text-[10px] text-primary-container uppercase">
                    {member.preferredMode}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-outline truncate">
                  {member.codmClass && (
                    <span className="text-on-surface-variant font-mono text-[11px] truncate">
                      {member.codmClass} •
                    </span>
                  )}
                  <span className="truncate">{member.region}</span>
                </div>

                <div className="flex items-center justify-between mt-0.5 pt-1 border-t border-surface-container-high/40 text-[11px] font-mono text-outline">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-primary-container">workspace_premium</span>
                    {member.tournamentsAttended} Tournaments
                  </span>
                  <span className="text-primary-container opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Profile <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* ULTRA-COMPACT TABLE / LIST VIEW FOR LARGE ROSTERS */
        <div className="bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl overflow-hidden">
          <div className="divide-y divide-surface-container-high/60">
            {filteredMembers.map((member) => (
              <Link
                href={`/player/${encodeURIComponent(member.codmUsername)}`}
                key={member.id}
                className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-surface-container-lowest/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-container-high overflow-hidden flex items-center justify-center shrink-0">
                    {member.profilePicture ? (
                      <img src={member.profilePicture} alt={member.codmUsername} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[20px] text-outline">person</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-on-surface truncate group-hover:text-primary-container transition-colors">
                      {member.codmUsername}
                    </div>
                    <div className="text-xs text-outline truncate">{member.fullName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {member.codmClass && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-surface-container-lowest border border-surface-container-high font-mono text-[11px] text-on-surface-variant">
                      {member.codmClass}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest border border-surface-container-high font-mono text-[10px] text-primary-container uppercase">
                    {member.preferredMode}
                  </span>
                  <span className="hidden md:inline-block text-xs text-outline w-28 truncate text-right">
                    {member.region}
                  </span>
                  <span className="font-mono text-xs text-on-surface flex items-center gap-1 w-12 justify-end">
                    <span className="material-symbols-outlined text-[14px] text-primary-container">workspace_premium</span>
                    {member.tournamentsAttended}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

