import { Plus, Trophy } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/prisma/db';
import { toJsDate } from '@/lib/temporal';

export default async function TournamentsList() {
  let tournaments: any[] = [];
  try {
    tournaments = await db.orm.public.Tournament
      .orderBy((t) => t.tournamentDate.desc())
      .include('participants', (p) => p)
      .all();
  } catch (e) {
    console.error('DB error', e);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface uppercase">Tournaments</h1>
          <p className="text-outline mt-1">Create, publish, and run clan battles.</p>
        </div>
        <Link href="/admin/tournaments/new" className="px-4 py-2 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> New Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-surface-container-low border border-surface-container-high border-dashed rounded-xl p-12 text-center text-outline">
          <Trophy className="w-8 h-8 mx-auto mb-3 opacity-50" />
          No tournaments yet. Create the first one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/admin/tournaments/${t.id}`}
              className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 hover:border-primary-container/50 transition-colors flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-on-surface">{t.name}</h3>
                <span className={
                  t.status === 'PUBLISHED' || t.status === 'ONGOING'
                    ? 'px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20 uppercase'
                    : t.status === 'DRAFT'
                    ? 'px-2 py-1 bg-surface-container-lowest text-outline text-xs rounded border border-surface-container-high uppercase'
                    : t.status === 'CANCELLED'
                    ? 'px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20 uppercase'
                    : 'px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20 uppercase'
                }>
                  {t.status}
                </span>
              </div>
              <p className="text-sm text-outline font-mono">{t.mode} | {t.teamSize}v{t.teamSize} • {toJsDate(t.tournamentDate).toLocaleDateString()}</p>
              <p className="text-sm text-outline">{t.participants.length} / {t.maxPlayers} invited</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
