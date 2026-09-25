'use server';

import { db } from '@/prisma/db';
import { getSessionUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { toTemporalDateTime } from '@/lib/temporal';

export async function createPost(formData: FormData) {
  const actor = await getSessionUser();
  if (!actor) {
    throw new Error('Not authorized');
  }

  const clan = await db.orm.public.Clan.first();
  if (!clan) {
    throw new Error('No clan found - seed the database first.');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = formData.get('category') as string;
  const publishedAtRaw = formData.get('publishedAt') as string;
  const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();

  if (!title || !content) {
    throw new Error('Title and content are required.');
  }

  await db.orm.public.Post.create({
    clanId: clan.id,
    authorId: actor.id,
    title,
    content,
    category: category as 'NEWS' | 'ACHIEVEMENT' | 'ANNOUNCEMENT' | 'TOURNAMENT',
    publishedAt: toTemporalDateTime(publishedAt),
  });

  revalidatePath('/admin/content');
  revalidatePath('/');
  redirect('/admin/content');
}
