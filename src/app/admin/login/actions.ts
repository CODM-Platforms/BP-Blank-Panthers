'use server'

import { db } from '@/prisma/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function authenticateAdmin(formData: FormData) {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  if (!identifier || !password) {
    return { error: 'Callsign and cipher are required' };
  }

  try {
    // 1. Find user by email or name (Callsign/IGN)
    const user = await db.user.findFirst({
      where: { 
        OR: [
          { email: identifier },
          { name: identifier }
        ]
      }
    });

    if (!user) {
      return { error: 'Invalid operator credentials' };
    }

    // 2. Verify password
    if (user.password !== password) {
      return { error: 'Invalid tactical cipher' };
    }

    // 3. Ensure user is an admin
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'CLAN_MASTER') {
      return { error: 'Clearance level insufficient' };
    }

    // 4. Set secure session cookie
    cookies().set('admin_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

  } catch (error) {
    console.error("Auth error:", error);
    return { error: 'System offline. Database connection failed.' };
  }

  // 5. Enter grid
  redirect('/admin');
}
