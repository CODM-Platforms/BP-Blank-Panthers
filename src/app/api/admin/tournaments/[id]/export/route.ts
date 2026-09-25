import { db } from '@/prisma/db';
import { getSessionUser } from '@/lib/session';
import { getBaseUrl } from '@/lib/url';
import { toJsDate } from '@/lib/temporal';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function resolveImageUrl(path: string | null, baseUrl: string): string | null {
  if (!path) return null;
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  return `${baseUrl}${path}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
    const clanName = escapeHtml(clan?.name ?? 'Clan');
    const clanTag = escapeHtml(clan?.tag ?? '');
    const logoUrl = resolveImageUrl(clan?.logo ?? '/logo/BP-BlackPanthers.jpeg', baseUrl);
    const tournamentName = escapeHtml(tournament.name);
    const tournamentDateStr = toJsDate(tournament.tournamentDate).toLocaleDateString();
    const generatedAt = new Date().toLocaleString();

    const teamGroups = new Map<string, typeof participants>();
    for (const p of participants) {
      const key = (p as any).team?.name ?? 'Unassigned';
      if (!teamGroups.has(key)) teamGroups.set(key, []);
      teamGroups.get(key)!.push(p);
    }
    const teamCount = Array.from(teamGroups.keys()).filter((k) => k !== 'Unassigned').length;

    const teamSections = Array.from(teamGroups.entries())
      .map(([teamName, members]) => `
        <section class="team">
          <h2>${escapeHtml(teamName)}</h2>
          <div class="cards">
            ${members
              .map((p: any) => {
                const m = p.member;
                const avatar = resolveImageUrl(m.profilePicture, baseUrl);
                return `
                <article class="card">
                  <div class="avatar">${avatar ? `<img src="${escapeHtml(avatar)}" alt="${escapeHtml(m.fullName)}" />` : '\u{1F464}'}</div>
                  <div class="info">
                    <h3>${escapeHtml(m.fullName)}</h3>
                    <p class="ign">${escapeHtml(m.codmUsername)}</p>
                    <dl>
                      <div><dt>\u{1F194} UID</dt><dd>${escapeHtml(m.codmUid)}</dd></div>
                      <div><dt>\u{1F4F1} WhatsApp</dt><dd>${escapeHtml(m.whatsappNumber)}</dd></div>
                      <div><dt>\u{1F4F2} Device</dt><dd>${escapeHtml(m.deviceModel)}</dd></div>
                      <div><dt>\u{1F4CD} Location</dt><dd>${escapeHtml(m.region)}, ${escapeHtml(m.country)}</dd></div>
                    </dl>
                  </div>
                </article>`;
              })
              .join('')}
          </div>
        </section>`)
      .join('');

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${tournamentName} — Roster</title>
<style>
  :root { --accent: #E8262C; --dark: #111318; --muted: #5b6270; --bg: #f7f6f3; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px; background: var(--bg); color: var(--dark); font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .sheet { max-width: 900px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 24px rgba(0,0,0,0.08); }
  header { display: flex; align-items: center; gap: 16px; padding: 28px 32px; border-bottom: 4px solid var(--accent); }
  header img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; }
  header .titles { flex: 1; }
  header .titles h1 { margin: 0; font-size: 18px; letter-spacing: 1px; text-transform: uppercase; }
  header .titles p { margin: 2px 0 0; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  header .meta { font-size: 11px; color: var(--muted); text-align: right; }
  .title-block { padding: 24px 32px 0; }
  .title-block h2 { margin: 0 0 4px; font-size: 26px; text-transform: uppercase; }
  .title-block p { margin: 0; color: var(--muted); font-size: 13px; }
  .stats { display: flex; gap: 16px; padding: 20px 32px; }
  .stat { flex: 1; background: #fdecec; border-left: 4px solid var(--accent); border-radius: 8px; padding: 14px 16px; }
  .stat .n { font-size: 26px; font-weight: 700; display: block; }
  .stat .l { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
  .team { padding: 0 32px 28px; }
  .team h2 { background: var(--dark); color: var(--accent); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 10px 14px; border-radius: 6px; margin: 0 0 14px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
  .card { border: 1px solid #e5e2db; border-radius: 10px; padding: 14px; display: flex; gap: 12px; }
  .avatar { width: 52px; height: 52px; border-radius: 50%; background: #f1efe9; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .info h3 { margin: 0; font-size: 14px; }
  .info .ign { margin: 1px 0 8px; color: var(--accent); font-weight: 700; font-size: 12px; }
  .info dl { margin: 0; display: flex; flex-direction: column; gap: 4px; }
  .info dl div { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; }
  .info dt { color: var(--muted); white-space: nowrap; }
  .info dd { margin: 0; text-align: right; }
  footer { display: flex; justify-content: space-between; padding: 16px 32px; border-top: 1px solid #eee; font-size: 10px; color: var(--muted); }
  @media print { body { padding: 0; background: #fff; } .sheet { box-shadow: none; border-radius: 0; } }
</style>
</head>
<body>
  <div class="sheet">
    <header>
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="${clanName}" />` : ''}
      <div class="titles">
        <h1>${clanName}</h1>
        <p>${clanTag} &middot; Elite CODM Division</p>
      </div>
      <div class="meta">Generated<br/>${escapeHtml(generatedAt)}</div>
    </header>
    <div class="title-block">
      <h2>${tournamentName}</h2>
      <p>${escapeHtml(tournamentDateStr)} &middot; ${escapeHtml(tournament.mode)}</p>
    </div>
    <div class="stats">
      <div class="stat"><span class="n">${participants.length}</span><span class="l">Confirmed Players</span></div>
      <div class="stat"><span class="n">${teamCount}</span><span class="l">Squads Formed</span></div>
    </div>
    ${teamSections || '<p style="padding:0 32px 28px;color:var(--muted)">No confirmed players yet.</p>'}
    <footer>
      <span>${clanName} &mdash; Tactical Directives Enforced</span>
      <span>\u{1F3C6} ${tournamentName}</span>
    </footer>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${tournament.name.replace(/[^a-z0-9]/gi, '_')}_roster.html"`,
      },
    });
  } catch (e) {
    console.error('Tournament roster export failed', e);
    return NextResponse.json(
      { error: 'Failed to generate export', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
