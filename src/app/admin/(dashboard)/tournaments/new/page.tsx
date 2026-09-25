import { Trophy, Calendar, Users, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateTournament() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-panther-text hover:text-panther-gold mb-2 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white">Create Tournament</h1>
        <p className="text-panther-text mt-2">Configure a new clan battle and send invitations automatically.</p>
      </div>

      <div className="bg-panther-card border border-panther-border rounded-xl p-8">
        <form className="space-y-8">
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-panther-gold border-b border-panther-border pb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5" /> Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-panther-text mb-1">Tournament Name</label>
              <input type="text" placeholder="e.g., Friday Night Clan Battle" className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold transition-colors" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-panther-text mb-1">Game</label>
                <input type="text" defaultValue="Call of Duty Mobile" disabled className="w-full bg-panther-dark/50 border border-panther-border rounded-lg px-4 py-3 text-panther-text cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-panther-text mb-1">Mode</label>
                <div className="relative">
                  <Gamepad2 className="absolute left-3 top-3.5 w-5 h-5 text-panther-text" />
                  <select className="w-full bg-panther-dark border border-panther-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-panther-gold transition-colors appearance-none">
                    <option value="BR">Battle Royale (BR)</option>
                    <option value="MP">Multiplayer (MP)</option>
                    <option value="CUSTOM">Custom Mode</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-panther-gold border-b border-panther-border pb-2 flex items-center gap-2">
              <Users className="w-5 h-5" /> Capacity & Teams
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-panther-text mb-1">Format (Team Size)</label>
                <select className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold transition-colors appearance-none">
                  <option value="4">Squad (4 Players)</option>
                  <option value="5">Team (5 Players)</option>
                  <option value="2">Duo (2 Players)</option>
                  <option value="1">Solo (1 Player)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-panther-text mb-1">Maximum Players</label>
                <input type="number" defaultValue={100} className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold transition-colors" />
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
              <div className="text-blue-400 mt-0.5">ℹ️</div>
              <p className="text-sm text-blue-200">
                The system will automatically calculate the required number of squads/teams based on confirmed attendees. (e.g., 40 confirmed ÷ 4 players = 10 squads).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-panther-gold border-b border-panther-border pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-panther-text mb-1">Tournament Date & Time</label>
                <input type="datetime-local" className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-panther-text mb-1">Registration Deadline</label>
                <input type="datetime-local" className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-end gap-4 border-t border-panther-border">
            <Link href="/admin" className="px-6 py-3 rounded-lg text-panther-text hover:text-white transition-colors">
              Cancel
            </Link>
            <button type="button" className="px-8 py-3 bg-panther-gold text-panther-dark rounded-lg font-bold hover:bg-panther-gold-hover transition-colors shadow-[0_0_15px_rgba(230,200,117,0.3)]">
              Create & Publish Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
