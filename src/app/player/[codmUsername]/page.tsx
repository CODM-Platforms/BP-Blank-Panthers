import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import { toJsDate } from '@/lib/temporal';

export default async function PlayerStats({ params }: { params: { codmUsername: string } }) {

  let player = null;
  try {
    player = await db.orm.public.Member
      .where({ codmUsername: decodeURIComponent(params.codmUsername) })
      .include('participants', (p) =>
        p
          .orderBy((pp) => pp.createdAt.desc())
          .include('tournament', (t) => t)
          .include('team', (t) => t),
      )
      .first();
  } catch (e) {
    console.error('DB error', e);
  }

  if (!player) {
    notFound();
  }

  const winRate = player.tournamentsInvited > 0 ? Math.round((player.tournamentsAttended / player.tournamentsInvited) * 100) : 0;

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/95 via-surface-container-lowest/90 to-surface-container-lowest/95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0c0e12_85%)]"></div>
      </div>

      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start pt-10 pb-margin">
        <div className="w-full max-w-5xl mx-auto px-margin-mobile md:px-margin">
          <Link href="/roster" className="text-primary-container text-sm hover:underline mb-6 inline-block">&larr; Back to Roster</Link>

          {/* Profile Header */}
          <div className="bg-surface-container-low/80 border border-surface-container-high rounded-xl p-space-lg flex flex-col md:flex-row items-center md:items-start gap-space-lg mb-space-lg">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-surface-container-lowest border-2 border-primary-container/40 relative overflow-hidden shrink-0">
              {player.profilePicture ? (
                <img src={player.profilePicture} alt={player.codmUsername} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[64px] text-primary-container/40">shield_person</span>
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1">
              <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight">{player.codmUsername}</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">{player.fullName}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-space-sm">
                <span className="px-3 py-1 bg-surface-container-highest border border-surface-container-high rounded text-xs font-mono text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary-container">track_changes</span> {player.preferredMode}
                </span>
                <span className="px-3 py-1 bg-surface-container-highest border border-surface-container-high rounded text-xs font-mono text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary-container">map</span> {player.region}, {player.country}
                </span>
                <span className="px-3 py-1 bg-surface-container-highest border border-surface-container-high rounded text-xs font-mono text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-primary-container">smartphone</span> {player.deviceModel}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-lg">
            <div className="bg-surface-container-low/80 border border-surface-container-high rounded-xl p-space-md text-center">
              <span className="block font-headline-sm text-headline-sm text-on-surface mb-1">{player.tournamentsAttended}</span>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Matches Played</span>
            </div>
            <div className="bg-surface-container-low/80 border border-surface-container-high rounded-xl p-space-md text-center">
              <span className="block font-headline-sm text-headline-sm text-primary-container mb-1">{winRate}%</span>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Attendance Rate</span>
            </div>
            <div className="bg-surface-container-low/80 border border-surface-container-high rounded-xl p-space-md text-center">
              <span className="block font-headline-sm text-headline-sm text-on-surface mb-1">{player.tournamentsDeclined}</span>
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Declined</span>
            </div>
            <div className="bg-surface-container-low/80 border border-red-500/20 rounded-xl p-space-md text-center">
              <span className="block font-headline-sm text-headline-sm text-red-400 mb-1">{player.tournamentsMissed}</span>
              <span className="font-label-sm text-label-sm text-red-400 uppercase tracking-widest">No Shows</span>
            </div>
          </div>

          {/* Tournament History */}
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface flex items-center gap-2 mb-space-md">
            <span className="material-symbols-outlined text-primary-container">calendar_month</span> Tournament History
          </h2>

          <div className="bg-surface-container-low/80 border border-surface-container-high rounded-xl overflow-hidden">
            {player.participants.length === 0 ? (
              <div className="p-8 text-center text-outline text-sm">
                No tournament history found for this player.
              </div>
            ) : (
              <div className="divide-y divide-surface-container-high">
                {player.participants.map((p: any) => (
                  <div key={p.id} className="p-space-md flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-surface-container-lowest/30 transition-colors">
                    <div>
                      <h3 className="font-title-md text-on-surface font-bold">{p.tournament.name}</h3>
                      <p className="text-sm text-outline mt-1">{toJsDate(p.tournament.tournamentDate).toLocaleDateString()} &middot; {p.tournament.mode}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.team && (
                        <span className="px-3 py-1 bg-surface-container-highest border border-primary-container/30 rounded text-sm text-primary-container font-bold">
                          {p.team.name}
                        </span>
                      )}
                      <span className={
                        'px-3 py-1 rounded text-xs font-bold border uppercase ' +
                        (p.attendanceStatus === 'ATTENDED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          p.attendanceStatus === 'NO_SHOW' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          p.attendanceStatus === 'DECLINED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20')
                      }>
                        {p.attendanceStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-surface-container-high/30 bg-surface-container-lowest mt-10">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">© 2026 BP Black Panthers Esports</span>
      </footer>
    </div>
  );
}
