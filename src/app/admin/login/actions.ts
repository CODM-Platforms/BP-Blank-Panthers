'use server'

import { db } from '@/prisma/db';
import { or } from '@prisma/orm-postgres/orm-client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function authenticateAdmin(formData: FormData) {
  const identifier = formData.get('identifier') as string;
  const password = formData.get('password') as string;

  if (!identifier || !password) {
    return { error: 'Callsign and cipher are required' };
  }

  try {
    // 1. Find user by email or name (Callsign/IGN)
    const user = await db.orm.public.User
      .where((u) => or(u.email.eq(identifier), u.name.eq(identifier)))
      .first();

    if (!user) {
      return { error: 'Invalid operator credentials' };
    }

    // 2. Verify password
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
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
