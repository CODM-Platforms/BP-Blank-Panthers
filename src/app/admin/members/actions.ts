'use server';

import { db } from '@/prisma/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toTemporalDateTime } from '@/lib/temporal';

const VALID_STATUSES = ['ACTIVE', 'WARNING', 'SUSPENDED', 'INACTIVE', 'REMOVED'] as const;
type MemberStatus = (typeof VALID_STATUSES)[number];

export async function updateMemberStatus(memberId: string, formData: FormData) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const status = formData.get('status') as string;
  if (!VALID_STATUSES.includes(status as MemberStatus)) {
    throw new Error('Invalid status');
  }
  const adminNotes = (formData.get('adminNotes') as string) || null;

  const suspensionDays = Number(formData.get('suspensionDays') ?? 0);
  const suspensionEnd =
    status === 'SUSPENDED' && suspensionDays > 0
      ? toTemporalDateTime(new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000))
      : null;

  await db.orm.public.Member.where({ id: memberId }).update({
    status: status as MemberStatus,
    adminNotes,
    suspensionEnd,
  });

  await db.orm.public.AuditLog.create({
    action: 'MEMBER_STATUS_CHANGED',
    details: `Member ${memberId} status set to ${status} by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin/members');
  revalidatePath(`/admin/members/${memberId}`);
  redirect('/admin/members');
}
