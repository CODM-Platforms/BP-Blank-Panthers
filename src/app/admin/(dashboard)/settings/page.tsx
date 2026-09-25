import { db } from '@/prisma/db';
import SettingsTabs from '@/components/admin/SettingsTabs';

export default async function AdminSettings() {
  let clan = null;
  try {
    clan = await db.orm.public.Clan.first();
  } catch (e) {
    console.error('DB error', e);
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white uppercase">Clan Settings</h1>
        <p className="text-panther-text mt-1">Configure clan info, attendance rules, and roles.</p>
      </div>

      {clan ? (
        <SettingsTabs clan={{ name: clan.name, tag: clan.tag, description: clan.description }} />
      ) : (
        <div className="bg-panther-card border border-panther-border rounded-xl p-8 text-center text-panther-text">
          No clan found - seed the database first.
        </div>
      )}
    </div>
  );
}
