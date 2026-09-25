'use client';

import { useMemo, useState } from 'react';
import { Users, Search, ShieldCheck, AlertTriangle, Ban } from 'lucide-react';
import Link from 'next/link';
import { toJsDate } from '@/lib/temporal';

type FilterKey = 'ALL' | 'PENDING' | 'WARNING' | 'SUSPENDED';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'WARNING', label: 'Warnings' },
  { key: 'SUSPENDED', label: 'Suspended' },
];

export default function MembersTable({ members }: { members: any[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (filter !== 'ALL' && member.status !== filter) return false;
      if (!q) return true;
      return (
        member.fullName.toLowerCase().includes(q) ||
        member.codmUsername.toLowerCase().includes(q)
      );
    });
  }, [members, query, filter]);

  return (
    <div className="bg-panther-card border border-panther-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-panther-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-panther-dark/50">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-panther-text" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-4 py-2 bg-panther-dark border border-panther-border rounded-lg text-sm text-white focus:outline-none focus:border-panther-gold"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={
                filter === f.key
                  ? 'px-3 py-1 bg-panther-gold text-panther-dark rounded font-bold text-sm whitespace-nowrap'
                  : 'px-3 py-1 bg-panther-dark border border-panther-border text-panther-text hover:text-white rounded text-sm whitespace-nowrap'
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-panther-text">
            No members match this search/filter.
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
              {filtered.map((member) => (
                <tr key={member.id} className="border-b border-panther-border/50 hover:bg-panther-dark/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-panther-dark border border-panther-border flex items-center justify-center overflow-hidden">
                        {member.profilePicture ? (
                          <img src={member.profilePicture} alt={member.codmUsername} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-5 h-5 text-panther-text" />
                        )}
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
                    {(member.status === 'INACTIVE' || member.status === 'REMOVED') && <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container-high text-panther-text text-xs rounded border border-panther-border">{member.status}</span>}
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
                  <td className="p-4 text-sm text-panther-text">{toJsDate(member.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {member.status === 'PENDING' ? (
                      <form action={`/api/members/${member.id}/approve`} method="POST">
                        <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold transition-colors">
                          Approve
                        </button>
                      </form>
                    ) : (
                      <Link href={`/admin/members/${member.id}`} className="text-sm text-panther-text hover:text-white underline">
                        Manage
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
