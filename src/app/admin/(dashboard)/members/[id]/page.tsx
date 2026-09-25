import { db } from '@/prisma/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toJsDate } from '@/lib/temporal';
import { updateMemberStatus } from '@/app/admin/members/actions';

export default async function MemberDetail({ params }: { params: { id: string } }) {
  let member = null;
  try {
    member = await db.orm.public.Member
      .where({ id: params.id })
      .include('approvedBy', (u) => u)
      .first();
  } catch (e) {
    console.error('DB error', e);
  }

  if (!member) {
    notFound();
  }

  const updateStatus = updateMemberStatus.bind(null, member.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link href="/admin/members" className="text-sm text-panther-text hover:text-panther-gold inline-block">
        &larr; Back to Operators
      </Link>

      <div className="bg-panther-card border border-panther-border rounded-xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-panther-dark border border-panther-border overflow-hidden flex items-center justify-center shrink-0">
          {member.profilePicture ? (
            <img src={member.profilePicture} alt={member.codmUsername} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-panther-text">person</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{member.fullName}</h1>
          <p className="text-panther-gold font-mono">{member.codmUsername}</p>
          <p className="text-xs text-panther-text mt-1">Status: <span className="font-bold">{member.status}</span></p>
        </div>
      </div>

      <div className="bg-panther-card border border-panther-border rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><span className="text-panther-text">Player ID</span><p className="text-white font-mono">{member.playerId}</p></div>
        <div><span className="text-panther-text">CODM UID</span><p className="text-white font-mono">{member.codmUid}</p></div>
        <div><span className="text-panther-text">WhatsApp</span><p className="text-white font-mono">{member.whatsappNumber}</p></div>
        <div><span className="text-panther-text">Device</span><p className="text-white">{member.deviceModel}</p></div>
        <div><span className="text-panther-text">Location</span><p className="text-white">{member.region}, {member.country}</p></div>
        <div><span className="text-panther-text">Preferred Mode</span><p className="text-white">{member.preferredMode}</p></div>
        <div><span className="text-panther-text">Joined</span><p className="text-white">{toJsDate(member.createdAt).toLocaleDateString()}</p></div>
        {member.approvedBy && (
          <div><span className="text-panther-text">Approved By</span><p className="text-white">{member.approvedBy.name}</p></div>
        )}
      </div>

      <div className="bg-panther-card border border-panther-border rounded-xl p-6 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-sm">
        <div><span className="block text-xl font-bold text-white">{member.tournamentsInvited}</span><span className="text-panther-text text-xs">Invited</span></div>
        <div><span className="block text-xl font-bold text-white">{member.tournamentsConfirmed}</span><span className="text-panther-text text-xs">Confirmed</span></div>
        <div><span className="block text-xl font-bold text-green-400">{member.tournamentsAttended}</span><span className="text-panther-text text-xs">Attended</span></div>
        <div><span className="block text-xl font-bold text-red-400">{member.tournamentsMissed}</span><span className="text-panther-text text-xs">Missed</span></div>
        <div><span className="block text-xl font-bold text-yellow-400">{member.tournamentsDeclined}</span><span className="text-panther-text text-xs">Declined</span></div>
      </div>

      <form action={updateStatus} className="bg-panther-card border border-panther-border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Manage Status</h2>

        <div>
          <label className="block text-sm font-medium text-panther-text mb-1">Status</label>
          <select name="status" defaultValue={member.status} className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold">
            <option value="ACTIVE">Active</option>
            <option value="WARNING">Warning</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
            <option value="REMOVED">Removed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-panther-text mb-1">Suspension length (days, only used if status is Suspended)</label>
          <input type="number" name="suspensionDays" min={0} defaultValue={7} className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold" />
        </div>

        <div>
          <label className="block text-sm font-medium text-panther-text mb-1">Admin Notes</label>
          <textarea name="adminNotes" defaultValue={member.adminNotes ?? ''} rows={3} className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold resize-none" placeholder="Reason for this action, internal notes..." />
        </div>

        <button type="submit" className="px-6 py-3 bg-panther-gold text-panther-dark font-bold rounded-lg hover:bg-panther-gold-hover transition-colors">
          Update Status
        </button>
      </form>
    </div>
  );
}
