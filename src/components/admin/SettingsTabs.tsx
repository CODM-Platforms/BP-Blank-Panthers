'use client';

import { useState } from 'react';
import { Settings2, Shield, Users } from 'lucide-react';
import { updateClanProfile } from '@/app/admin/settings/actions';

type TabKey = 'profile' | 'attendance' | 'roles';

export default function SettingsTabs({ clan }: { clan: { name: string; tag: string; description: string | null } }) {
  const [tab, setTab] = useState<TabKey>('profile');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Sidebar Nav */}
      <div className="space-y-2">
        <button
          onClick={() => setTab('profile')}
          className={
            tab === 'profile'
              ? 'w-full text-left px-4 py-3 bg-panther-gold/10 text-panther-gold border border-panther-gold/30 rounded-lg font-bold flex items-center gap-3 transition-colors'
              : 'w-full text-left px-4 py-3 text-panther-text hover:bg-panther-dark border border-transparent hover:border-panther-border rounded-lg flex items-center gap-3 transition-colors'
          }
        >
          <Shield className="w-5 h-5" /> Clan Profile
        </button>
        <button
          onClick={() => setTab('attendance')}
          className={
            tab === 'attendance'
              ? 'w-full text-left px-4 py-3 bg-panther-gold/10 text-panther-gold border border-panther-gold/30 rounded-lg font-bold flex items-center gap-3 transition-colors'
              : 'w-full text-left px-4 py-3 text-panther-text hover:bg-panther-dark border border-transparent hover:border-panther-border rounded-lg flex items-center gap-3 transition-colors'
          }
        >
          <Settings2 className="w-5 h-5" /> Attendance Rules
        </button>
        <button
          onClick={() => setTab('roles')}
          className={
            tab === 'roles'
              ? 'w-full text-left px-4 py-3 bg-panther-gold/10 text-panther-gold border border-panther-gold/30 rounded-lg font-bold flex items-center gap-3 transition-colors'
              : 'w-full text-left px-4 py-3 text-panther-text hover:bg-panther-dark border border-transparent hover:border-panther-border rounded-lg flex items-center gap-3 transition-colors'
          }
        >
          <Users className="w-5 h-5" /> Roles &amp; Permissions
        </button>
      </div>

      {/* Main Panel */}
      <div className="md:col-span-2 bg-panther-card border border-panther-border rounded-xl p-6">
        {tab === 'profile' && (
          <>
            <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-panther-border flex items-center gap-2">
              <Shield className="w-5 h-5 text-panther-gold" /> Clan Profile
            </h2>
            <form action={updateClanProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Clan Name</label>
                <input type="text" name="name" required defaultValue={clan.name} className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Clan Tag</label>
                <input type="text" name="tag" required defaultValue={clan.tag} className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold" />
              </div>
              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Description</label>
                <textarea name="description" defaultValue={clan.description ?? ''} rows={4} className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold resize-none" />
              </div>
              <div className="pt-2 text-right">
                <button type="submit" className="px-6 py-3 bg-panther-gold text-panther-dark font-bold rounded-lg hover:bg-panther-gold-hover transition-colors">
                  Save Profile
                </button>
              </div>
            </form>
          </>
        )}

        {tab === 'attendance' && (
          <>
            <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-panther-border flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-panther-gold" /> Attendance &amp; Discipline Rules
            </h2>
            <div className="text-panther-text text-sm bg-panther-dark border border-panther-border rounded-lg p-6 text-center">
              Not built yet - configurable warning/suspension thresholds are on the roadmap.
              Right now, discipline actions are applied manually per-member from the Operators page.
            </div>
          </>
        )}

        {tab === 'roles' && (
          <>
            <h2 className="text-xl font-bold text-white mb-6 pb-4 border-b border-panther-border flex items-center gap-2">
              <Users className="w-5 h-5 text-panther-gold" /> Roles &amp; Permissions
            </h2>
            <div className="text-panther-text text-sm bg-panther-dark border border-panther-border rounded-lg p-6 text-center">
              Not built yet - roles today are fixed (Super Admin, Clan Master, Tournament Manager,
              Moderator) with no per-role permission editing. Account roles are set when seeding admins.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
