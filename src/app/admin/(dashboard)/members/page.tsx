import { db } from '@/prisma/db';
import MembersTable from '@/components/admin/MembersTable';

export default async function MembersDashboard() {
  // Fetch real members from the database
  // We use a try-catch so the page doesn't crash if the DB isn't seeded yet
  let members: any[] = [];
  const stats = { total: 0, active: 0, pending: 0, warning: 0, suspended: 0 };

  try {
    members = await db.orm.public.Member
      .orderBy((m) => m.createdAt.desc())
      .include('approvedBy', (u) => u)
      .all();

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
          <h1 className="text-3xl font-bold text-white uppercase">Clan Members</h1>
          <p className="text-panther-text mt-1">Manage approvals, attendance, and discipline.</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-panther-card border border-panther-border rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-white">{stats.total}</span>
          <p className="text-xs text-panther-text uppercase font-bold mt-1">Total</p>
        </div>
        <div className="bg-panther-card border border-green-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-green-400">{stats.active}</span>
          <p className="text-xs text-green-400/70 uppercase font-bold mt-1">Active</p>
        </div>
        <div className="bg-panther-card border border-blue-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-blue-400">{stats.pending}</span>
          <p className="text-xs text-blue-400/70 uppercase font-bold mt-1">Pending</p>
        </div>
        <div className="bg-panther-card border border-yellow-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-yellow-400">{stats.warning}</span>
          <p className="text-xs text-yellow-400/70 uppercase font-bold mt-1">Warning</p>
        </div>
        <div className="bg-panther-card border border-red-500/30 rounded-xl p-4 text-center">
          <span className="text-2xl font-bold text-red-400">{stats.suspended}</span>
          <p className="text-xs text-red-400/70 uppercase font-bold mt-1">Suspended</p>
        </div>
      </div>

      <MembersTable members={members} />
    </div>
  );
}
