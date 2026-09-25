import { db } from '@/prisma/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toJsDate } from '@/lib/temporal';
import { updateMemberStatus, updateMemberProfile } from '@/app/admin/members/actions';
import { buildWhatsAppLink } from '@/lib/whatsapp';

export default async function MemberDetail({ params }: { params: { id: string } }) {
  let member = null;
  let clan = null;
  try {
    member = await db.orm.public.Member
      .where({ id: params.id })
      .include('approvedBy', (u) => u)
      .include('user', (u) => u)
      .first();
    clan = await db.orm.public.Clan.first();
  } catch (e) {
    console.error('DB error', e);
  }

  if (!member) {
    notFound();
  }

  const updateStatus = updateMemberStatus.bind(null, member.id);
  const updateProfile = updateMemberProfile.bind(null, member.id);

  const isStaff = !!member.user;

  const whatsappInviteLink = clan?.whatsappGroupLink && !isStaff
    ? buildWhatsAppLink(
        member.whatsappNumber,
        `Hey ${member.fullName}! You've been approved to join ${clan.name}. Join our WhatsApp group here: ${clan.whatsappGroupLink}`
      )
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link href="/admin/members" className="text-sm text-outline hover:text-primary-container inline-block">
        &larr; Back to Operators
      </Link>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-surface-container-lowest border border-surface-container-high overflow-hidden flex items-center justify-center shrink-0">
          {member.profilePicture ? (
            <img src={member.profilePicture} alt={member.codmUsername} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-outline">person</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface">{member.fullName}</h1>
            {member.user && (
              <span className="px-2 py-0.5 bg-primary-container/10 border border-primary-container/30 text-primary-container text-xs rounded-full uppercase font-bold">
                {member.user.role.replace('_', ' ')}
              </span>
            )}
          </div>
          <p className="text-primary-container font-mono">{member.codmUsername}</p>
          <p className="text-xs text-outline mt-1">Status: <span className="font-bold">{member.status}</span></p>
        </div>
        {whatsappInviteLink && (
          <a
            href={whatsappInviteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg font-bold hover:bg-green-500/20 transition-colors flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span> Send WhatsApp Invite
          </a>
        )}
      </div>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><span className="text-outline">CODM UID</span><p className="text-on-surface font-mono">{member.codmUid}</p></div>
        <div><span className="text-outline">WhatsApp</span><p className="text-on-surface font-mono">{member.whatsappNumber}</p></div>
        <div><span className="text-outline">Device</span><p className="text-on-surface">{member.deviceModel}</p></div>
        <div><span className="text-outline">Location</span><p className="text-on-surface">{member.region}, {member.country}</p></div>
        <div><span className="text-outline">Preferred Mode</span><p className="text-on-surface">{member.preferredMode}</p></div>
        <div><span className="text-outline">Joined</span><p className="text-on-surface">{toJsDate(member.createdAt).toLocaleDateString()}</p></div>
        {member.approvedBy && (
          <div><span className="text-outline">Approved By</span><p className="text-on-surface">{member.approvedBy.name}</p></div>
        )}
      </div>

      <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center text-sm">
        <div><span className="block text-xl font-bold text-on-surface">{member.tournamentsInvited}</span><span className="text-outline text-xs">Invited</span></div>
        <div><span className="block text-xl font-bold text-on-surface">{member.tournamentsConfirmed}</span><span className="text-outline text-xs">Confirmed</span></div>
        <div><span className="block text-xl font-bold text-green-400">{member.tournamentsAttended}</span><span className="text-outline text-xs">Attended</span></div>
        <div><span className="block text-xl font-bold text-red-400">{member.tournamentsMissed}</span><span className="text-outline text-xs">Missed</span></div>
        <div><span className="block text-xl font-bold text-yellow-400">{member.tournamentsDeclined}</span><span className="text-outline text-xs">Declined</span></div>
      </div>

      <form action={updateProfile} className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-on-surface">Edit Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-outline mb-1">Full Name</label>
            <input name="fullName" type="text" required defaultValue={member.fullName} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">CODM Username</label>
            <input name="codmUsername" type="text" required defaultValue={member.codmUsername} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface font-mono focus:outline-none focus:border-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">CODM UID</label>
            <input name="codmUid" type="text" required defaultValue={member.codmUid} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface font-mono focus:outline-none focus:border-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">WhatsApp Number</label>
            <input name="whatsappNumber" type="text" required defaultValue={member.whatsappNumber} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface font-mono focus:outline-none focus:border-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">Device Model</label>
            <input name="deviceModel" type="text" required defaultValue={member.deviceModel} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">Device Serial (last 6)</label>
            <input name="deviceSerial" type="text" required maxLength={6} defaultValue={member.deviceSerial} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface font-mono focus:outline-none focus:border-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">Country</label>
            <input name="country" type="text" required defaultValue={member.country} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">Region</label>
            <input name="region" type="text" required defaultValue={member.region} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-outline mb-1">Preferred Mode</label>
            <select name="preferredMode" defaultValue={member.preferredMode} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container appearance-none">
              <option value="BR">Battle Royale (BR)</option>
              <option value="MP">Multiplayer (MP)</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>

        <button type="submit" className="px-6 py-3 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors">
          Save Profile
        </button>
      </form>

      <form action={updateStatus} className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-on-surface">Manage Status</h2>

        <div>
          <label className="block text-sm font-medium text-outline mb-1">Status</label>
          <select name="status" defaultValue={member.status} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container">
            <option value="ACTIVE">Active</option>
            <option value="WARNING">Warning</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
            <option value="REMOVED">Removed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-outline mb-1">Suspension length (days, only used if status is Suspended)</label>
          <input type="number" name="suspensionDays" min={0} defaultValue={7} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container" />
        </div>

        <div>
          <label className="block text-sm font-medium text-outline mb-1">Admin Notes</label>
          <textarea name="adminNotes" defaultValue={member.adminNotes ?? ''} rows={3} className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container resize-none" placeholder="Reason for this action, internal notes..." />
        </div>

        <button type="submit" className="px-6 py-3 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors">
          Update Status
        </button>
      </form>
    </div>
  );
}
