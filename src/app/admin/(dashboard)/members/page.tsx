import { db } from '@/prisma/db';
import MembersTable from '@/components/admin/MembersTable';
import { sanitizeForClient } from '@/lib/temporal';

export default async function MembersDashboard() {
  // Fetch real members from the database
  // We use a try-catch so the page doesn't crash if the DB isn't seeded yet
  let commandStaff: any[] = [];
  let members: any[] = [];
  const stats = { total: 0, active: 0, pending: 0, warning: 0, suspended: 0 };

  try {
    const all = await db.orm.public.Member
      .orderBy((m) => m.createdAt.desc())
      .include('approvedBy', (u) => u)
      .include('user', (u) => u)
      .all();

    // Admins/clan masters are also linked as members so they can join
    // tournaments, but they're staff, not applicants - keep them out of the
    // regular roster list and its approval/discipline stats.
    commandStaff = all.filter((m: any) => m.user);
    members = all.filter((m: any) => !m.user);

    stats.total = members.length;
    stats.active = members.filter(m => m.status === 'ACTIVE').length;
    stats.pending = members.filter(m => m.status === 'PENDING').length;
    stats.warning = members.filter(m => m.status === 'WARNING').length;
    stats.suspended = members.filter(m => m.status === 'SUSPENDED').length;
  } catch (error) {
    console.error("Database connection failed or tables not created yet.");
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface uppercase">Clan Members</h1>
          <p className="text-outline mt-1">Manage approvals, attendance, and discipline.</p>
        </div>
      </div>

      {/* Command Staff */}
      {commandStaff.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-on-surface uppercase">Command Staff</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {commandStaff.map((m) => (
              <div key={m.id} className="bg-surface-container-low border border-surface-container-high rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-container-lowest border border-surface-container-high overflow-hidden flex items-center justify-center shrink-0">
                  {m.profilePicture ? (
                    <img src={m.profilePicture} alt={m.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline">person</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-on-surface truncate">{m.fullName}</div>
                  <div className="text-xs text-primary-container font-mono truncate">{m.user.role.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-on-surface">{stats.total}</span>
          <p className="text-xs text-outline uppercase font-bold mt-1">Total</p>
        </div>
        <div className="bg-surface-container-low border border-green-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-green-400">{stats.active}</span>
          <p className="text-xs text-green-400/70 uppercase font-bold mt-1">Active</p>
        </div>
        <div className="bg-surface-container-low border border-blue-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-blue-400">{stats.pending}</span>
          <p className="text-xs text-blue-400/70 uppercase font-bold mt-1">Pending</p>
        </div>
        <div className="bg-surface-container-low border border-yellow-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-yellow-400">{stats.warning}</span>
          <p className="text-xs text-yellow-400/70 uppercase font-bold mt-1">Warning</p>
        </div>
        <div className="bg-surface-container-low border border-red-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-red-400">{stats.suspended}</span>
          <p className="text-xs text-red-400/70 uppercase font-bold mt-1">Suspended</p>
        </div>
      </div>

      <MembersTable members={sanitizeForClient(members)} />
    </div>
  );
}
