import { db } from '@/prisma/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Ensure the BP Panthers Clan exists
    let clan = await db.clan.findFirst({ where: { tag: 'BP' } });
    if (!clan) {
      clan = await db.clan.create({
        data: { name: 'BP Black Panthers', tag: 'BP' }
      });
    }

    const admins = [
      { name: "Super Admin", email: "superadmin@bp-panthers.com", password: "adminpassword123", role: "SUPER_ADMIN" },
      { name: "Clan Master One", email: "master1@bp-panthers.com", password: "adminpassword123", role: "CLAN_MASTER" },
      { name: "Clan Master Two", email: "master2@bp-panthers.com", password: "adminpassword123", role: "CLAN_MASTER" },
      { name: "Clan Master Three", email: "master3@bp-panthers.com", password: "adminpassword123", role: "CLAN_MASTER" }
    ];

    for (const admin of admins) {
      const existing = await db.user.findFirst({ where: { name: admin.name } });
      if (!existing) {
        await db.user.create({ data: admin });
      }
    }

    return NextResponse.json({ success: true, message: "All 4 Admins created successfully! You can now log in!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
