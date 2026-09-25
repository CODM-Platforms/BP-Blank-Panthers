'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { markAttendance } from '@/app/admin/tournaments/actions';

type TabKey = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'ATTENDED' | 'NO_SHOW';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'DECLINED', label: 'Declined' },
  { key: 'ATTENDED', label: 'Attended' },
  { key: 'NO_SHOW', label: 'No-Show' },
];

interface Props {
  participants: any[];
  tournamentName: string;
  tournamentDate: string;
  appUrl: string;
}

export default function TournamentParticipants({ participants, tournamentName, tournamentDate, appUrl }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const counts: Record<TabKey, number> = {
    PENDING: 0, CONFIRMED: 0, DECLINED: 0, ATTENDED: 0, NO_SHOW: 0,
  };
  for (const p of participants) {
    if (p.attendanceStatus in counts) counts[p.attendanceStatus as TabKey]++;
  }

  const [tab, setTab] = useState<TabKey>('PENDING');
  const shown = participants.filter((p) => p.attendanceStatus === tab);

  const handleAttendance = (participantId: string, status: 'ATTENDED' | 'NO_SHOW') => {
    startTransition(async () => {
      await markAttendance(participantId, status);
      router.refresh();
    });
  };

  return (
    <div className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
      <div className="border-b border-surface-container-high p-4 flex gap-6 bg-surface-container-lowest/50 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              tab === t.key
                ? 'text-primary-container font-bold border-b-2 border-primary-container pb-2 -mb-4 px-2 whitespace-nowrap'
                : 'text-outline hover:text-on-surface pb-2 -mb-4 px-2 whitespace-nowrap'
            }
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      <div className="p-6">
        {shown.length === 0 ? (
          <p className="text-outline text-sm italic">No players in this category.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-high text-sm text-outline">
                <th className="pb-3 font-medium">Player</th>
                <th className="pb-3 font-medium">UID</th>
                <th className="pb-3 font-medium">Squad</th>
                {(tab === 'PENDING' || tab === 'CONFIRMED') && <th className="pb-3 font-medium text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p.id} className="border-b border-surface-container-high/50 hover:bg-surface-container-lowest/30">
                  <td className="py-4 font-bold text-on-surface">{p.member.fullName}</td>
                  <td className="py-4 text-outline font-mono text-sm">{p.member.codmUid}</td>
                  <td className="py-4 text-outline text-sm">{p.team?.name ?? '—'}</td>
                  {tab === 'PENDING' && (
                    <td className="py-4 text-right">
                      <a
                        href={buildWhatsAppLink(
                          p.member.whatsappNumber,
                          `Hey ${p.member.fullName}! You've been invited to ${tournamentName} on ${tournamentDate}. Confirm here: ${appUrl}/confirm/${p.secureToken}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-sm hover:bg-green-500/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span> Send Invite
                      </a>
                    </td>
                  )}
                  {tab === 'CONFIRMED' && (
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          disabled={isPending}
                          onClick={() => handleAttendance(p.id, 'ATTENDED')}
                          className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded text-sm hover:bg-green-500/20 transition-colors disabled:opacity-50"
                        >
                          Attended
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleAttendance(p.id, 'NO_SHOW')}
                          className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          No-Show
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
