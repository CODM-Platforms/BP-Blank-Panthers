'use client';

import { useState } from 'react';

type TabKey = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'ATTENDED' | 'NO_SHOW';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'DECLINED', label: 'Declined' },
  { key: 'ATTENDED', label: 'Attended' },
  { key: 'NO_SHOW', label: 'No-Show' },
];

export default function TournamentParticipants({ participants }: { participants: any[] }) {
  const counts: Record<TabKey, number> = {
    PENDING: 0, CONFIRMED: 0, DECLINED: 0, ATTENDED: 0, NO_SHOW: 0,
  };
  for (const p of participants) {
    if (p.attendanceStatus in counts) counts[p.attendanceStatus as TabKey]++;
  }

  const [tab, setTab] = useState<TabKey>('PENDING');
  const shown = participants.filter((p) => p.attendanceStatus === tab);

  return (
    <div className="bg-panther-card border border-panther-border rounded-xl overflow-hidden">
      <div className="border-b border-panther-border p-4 flex gap-6 bg-panther-dark/50 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? 'text-panther-gold font-bold border-b-2 border-panther-gold pb-2 -mb-4 px-2 whitespace-nowrap'
                : 'text-panther-text hover:text-white pb-2 -mb-4 px-2 whitespace-nowrap'
            }
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      <div className="p-6">
        {shown.length === 0 ? (
          <p className="text-panther-text text-sm italic">No players in this category.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-panther-border text-sm text-panther-text">
                <th className="pb-3 font-medium">Player</th>
                <th className="pb-3 font-medium">UID</th>
                <th className="pb-3 font-medium">Squad</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} className="border-b border-panther-border/50 hover:bg-panther-dark/30">
                  <td className="py-4 font-bold text-white">{p.member.fullName}</td>
                  <td className="py-4 text-panther-text font-mono text-sm">{p.member.codmUid}</td>
                  <td className="py-4 text-panther-text text-sm">{p.team?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
