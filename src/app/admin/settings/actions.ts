'use server';

import { db } from '@/prisma/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function updateClanProfile(formData: FormData) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const clan = await db.orm.public.Clan.first();
  if (!clan) {
    throw new Error('No clan found - seed the database first.');
  }

  const name = formData.get('name') as string;
  const tag = formData.get('tag') as string;
  const description = (formData.get('description') as string) || null;

  if (!name || !tag) {
    throw new Error('Name and tag are required.');
  }

  await db.orm.public.Clan.where({ id: clan.id }).update({ name, tag, description });

  await db.orm.public.AuditLog.create({
    action: 'CLAN_PROFILE_UPDATED',
    details: `Clan profile updated by ${actor.name} (${actor.id}).`,
    userId: actor.id,
  });

  revalidatePath('/admin/settings');
  revalidatePath('/');
}
