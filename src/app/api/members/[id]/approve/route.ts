import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const actorId = cookies().get('admin_session')?.value;
  if (!actorId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const actor = await db.orm.public.User.first({ id: actorId });
  if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'CLAN_MASTER')) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // Every approval is attributed to the designated lead clan master, no
  // matter which admin/clan master actually clicked approve. The real actor
  // is still recorded on the AuditLog entry below for internal traceability.
  const lead = await db.orm.public.User.where({ isLead: true }).first();
  const approvedById = lead?.id ?? actor.id;

  try {
    await db.orm.public.Member.where({ id: params.id }).update({
      status: 'ACTIVE',
      approvedById,
    });

    await db.orm.public.AuditLog.create({
      action: 'MEMBER_APPROVED',
      details: `Member ${params.id} approved by ${actor.name} (${actor.id}). Displayed approver: ${lead?.name ?? actor.name}.`,
      userId: actor.id,
    });
  } catch (error) {
    console.error("Failed to approve member:", error);
  }

  redirect('/admin');
}
