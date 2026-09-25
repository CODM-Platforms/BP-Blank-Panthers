import { Trophy, Calendar, Users, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { createTournament } from '@/app/admin/tournaments/actions';

export default function CreateTournament() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-outline hover:text-primary-container mb-2 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-on-surface">Create Tournament</h1>
        <p className="text-outline mt-2">Configure a new clan battle.</p>
      </div>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-8">
        <form action={createTournament} className="space-y-8">

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-container border-b border-surface-container-high pb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-outline mb-1">Tournament Name</label>
              <input type="text" name="name" required placeholder="e.g., Friday Night Clan Battle" className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Game</label>
                <input type="text" defaultValue="Call of Duty Mobile" disabled className="w-full bg-surface-container-lowest/50 border border-surface-container-high rounded-lg px-4 py-3 text-outline cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Mode</label>
                <div className="relative">
                  <Gamepad2 className="absolute left-3 top-3.5 w-5 h-5 text-outline" />
                  <select name="mode" required defaultValue="BR" className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg pl-10 pr-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors appearance-none">
                    <option value="BR">Battle Royale (BR)</option>
                    <option value="MP">Multiplayer (MP)</option>
                    <option value="CUSTOM">Custom Mode</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-container border-b border-surface-container-high pb-2 flex items-center gap-2">
              <Users className="w-5 h-5" /> Capacity & Teams
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Format (Team Size)</label>
                <select name="teamSize" required defaultValue="4" className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors appearance-none">
                  <option value="4">Squad (4 Players)</option>
                  <option value="5">Team (5 Players)</option>
                  <option value="2">Duo (2 Players)</option>
                  <option value="1">Solo (1 Player)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Maximum Players</label>
                <input type="number" name="maxPlayers" required defaultValue={100} min={1} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors" />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
              <div className="text-blue-400 mt-0.5">&#8505;</div>
              <p className="text-sm text-blue-200">
                Squads are built manually from confirmed attendees once registration closes (Tournament &rarr; Team Builder).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-container border-b border-surface-container-high pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Registration Deadline</label>
                <input type="datetime-local" name="registrationEnd" required className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors" />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium text-outline mb-1">Start Time</label>
                <input type="datetime-local" name="tournamentDate" required className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-outline mb-1">End Time</label>
                <input type="datetime-local" name="tournamentEnd" required className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors" />
              </div>
            </div>
            <p className="text-xs text-outline">Attendance is marked automatically once the End Time passes.</p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4 border-t border-surface-container-high">
            <Link href="/admin" className="px-6 py-3 rounded-lg text-outline hover:text-on-surface transition-colors">
              Cancel
            </Link>
            <button type="submit" className="px-8 py-3 bg-primary-container text-surface-container-lowest rounded-lg font-bold hover:bg-primary-fixed-dim transition-colors shadow-[0_0_15px_rgba(255,59,59,0.3)]">
              Create & Publish Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
