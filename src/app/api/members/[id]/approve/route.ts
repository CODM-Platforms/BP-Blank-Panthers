import { db } from '@/prisma/db';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.member.update({
      where: { id: params.id },
      data: { status: 'ACTIVE' }
    });
  } catch (error) {
    console.error("Failed to approve member:", error);
  }
  
  redirect('/admin');
}
