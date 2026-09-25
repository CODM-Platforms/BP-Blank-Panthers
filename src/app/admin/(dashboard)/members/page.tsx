import { Users, Search, Filter, ShieldCheck, AlertTriangle, Ban } from 'lucide-react';
import { db } from '@/prisma/db';
import Link from 'next/link';
import Image from 'next/image';

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
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-panther-dark border border-panther-border rounded-lg text-white hover:border-panther-gold transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
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

      {/* Main Table */}
      <div className="bg-panther-card border border-panther-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-panther-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-panther-dark/50">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-panther-text" />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full pl-9 pr-4 py-2 bg-panther-dark border border-panther-border rounded-lg text-sm text-white focus:outline-none focus:border-panther-gold"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            <button className="px-3 py-1 bg-panther-gold text-panther-dark rounded font-bold text-sm">All</button>
            <button className="px-3 py-1 bg-panther-dark border border-panther-border text-panther-text hover:text-white rounded text-sm">Pending</button>
            <button className="px-3 py-1 bg-panther-dark border border-panther-border text-panther-text hover:text-white rounded text-sm">Warnings</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {members.length === 0 ? (
             <div className="p-8 text-center text-panther-text">
               No members found. Waiting for registrations or database connection.
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-panther-dark border-b border-panther-border text-xs text-panther-text uppercase tracking-wider">
                  <th className="p-4 font-medium">Member</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Attendance</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-panther-border/50 hover:bg-panther-dark/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-panther-dark border border-panther-border flex items-center justify-center">
                          <Users className="w-5 h-5 text-panther-text" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{member.fullName}</div>
                          <div className="text-xs text-panther-gold font-mono">{member.codmUsername}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {member.status === 'PENDING' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20"><ShieldCheck className="w-3 h-3"/> Pending Approval</span>}
                      {member.status === 'ACTIVE' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20"><ShieldCheck className="w-3 h-3"/> Active</span>}
                      {member.status === 'WARNING' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20"><AlertTriangle className="w-3 h-3"/> Warning</span>}
                      {member.status === 'SUSPENDED' && <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20"><Ban className="w-3 h-3"/> Suspended</span>}
                      {member.approvedBy && (
                        <div className="text-[11px] text-panther-text mt-1">Approved by {member.approvedBy.name}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {member.tournamentsInvited > 0 ? `${Math.round((member.tournamentsAttended / member.tournamentsInvited) * 100)}%` : 'N/A'}
                      </div>
                      <div className="text-xs text-panther-text">Tournaments</div>
                    </td>
                    <td className="p-4 text-sm text-panther-text">{new Date(member.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {member.status === 'PENDING' ? (
                        <form action={`/api/members/${member.id}/approve`} method="POST">
                          <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold transition-colors">
                            Approve
                          </button>
                        </form>
                      ) : (
                        <button className="text-sm text-panther-text hover:text-white underline">
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
