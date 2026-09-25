import { db } from '@/prisma/db';
import { cookies } from 'next/headers';

export async function getSessionUser() {
  const userId = cookies().get('admin_session')?.value;
  if (!userId) return null;

  const user = await db.orm.public.User
    .where({ id: userId })
    .include('member', (m) => m)
    .first();
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'CLAN_MASTER')) {
    return null;
  }
  return user;
}
