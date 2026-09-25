'use client';

import { Trash2 } from 'lucide-react';
import { deleteTournament } from '@/app/admin/tournaments/actions';

export default function DeleteTournamentButton({ tournamentId, tournamentName }: { tournamentId: string; tournamentName: string }) {
  const doDelete = deleteTournament.bind(null, tournamentId);

  return (
    <form
      action={doDelete}
      onSubmit={(e) => {
        if (!confirm(`Permanently delete "${tournamentName}"? This removes all its participants, squads, and result photos. This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2">
        <Trash2 className="w-4 h-4" /> Delete
      </button>
    </form>
  );
}
