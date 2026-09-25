import { db } from '@/prisma/db';
import { getSessionUser } from '@/lib/session';
import { getBaseUrl } from '@/lib/url';
import { toJsDate } from '@/lib/temporal';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import TournamentRosterPdf from '@/components/pdf/TournamentRosterPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function resolveImageUrl(path: string | null, baseUrl: string): string | null {
  if (!path) return null;
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return `${baseUrl}${path}`;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await getSessionUser();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  const tournament = await db.orm.public.Tournament.first({ id: params.id });
  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
  }

  try {
    const clan = await db.orm.public.Clan.first();

    const participants = await db.orm.public.Participant
      .where({ tournamentId: params.id })
      .where((p) => p.attendanceStatus.eq('CONFIRMED'))
      .include('member', (m) => m)
      .include('team', (t) => t)
      .all();

    const baseUrl = getBaseUrl();

    const pdfBuffer = await renderToBuffer(
      TournamentRosterPdf({
        clanName: clan?.name ?? 'Clan',
        clanTag: clan?.tag ?? '',
        // A remote logo/avatar that 404s or times out takes react-pdf's
        // renderer down with it, so only pass through what's actually there.
        logoUrl: resolveImageUrl(clan?.logo ?? '/logo/BP-BlackPanthers.jpeg', baseUrl),
        tournamentName: tournament.name,
        tournamentDate: toJsDate(tournament.tournamentDate).toLocaleDateString(),
        tournamentMode: tournament.mode,
        generatedAt: new Date().toLocaleString(),
        participants: participants.map((p: any) => ({
          team: p.team ? { name: p.team.name } : null,
          member: {
            fullName: p.member.fullName,
            codmUsername: p.member.codmUsername,
            codmUid: p.member.codmUid,
            deviceModel: p.member.deviceModel,
            whatsappNumber: p.member.whatsappNumber,
            country: p.member.country,
            region: p.member.region,
            profilePicture: resolveImageUrl(p.member.profilePicture, baseUrl),
          },
        })),
      })
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${tournament.name.replace(/[^a-z0-9]/gi, '_')}_roster.pdf"`,
      },
    });
  } catch (e) {
    console.error('Tournament roster PDF export failed', e);
    return NextResponse.json(
      { error: 'Failed to generate PDF', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
