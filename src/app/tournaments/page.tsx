
import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { db } from '@/prisma/db';

export default async function PublicTournaments() {
  let tournaments = [];
  try {
    tournaments = await db.tournament.findMany({
      orderBy: { tournamentDate: 'desc' },
      include: {
        _count: { select: { participants: { where: { attendanceStatus: 'CONFIRMED' } } } }
      }
    });
  } catch(e) {
    console.error("DB not connected yet.");
  }

  const activeTournaments = tournaments.filter((t: any) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
  const pastTournaments = tournaments.filter((t: any) => t.status === 'COMPLETED');

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Background Graphic */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 filter contrast-125 saturate-50 scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-9rTGcur1BRSQSmqEmNfM2OrWE8PDOIgAweVjC7yOz6s6kHmLE08ElDVIdVTG-HLfn7RBP-Lw6rCqPYQTtI4SXgeQ0pwzZoEXAYOBzZqSgtWHyqqXy8xgIDy9RZ5wEA7Ud5Jv_sr720Ar2MgacpEkAOxurNZa4cRB3AgShwrQ_wgfY7Vi8kD3N5OIi8pAofbKAyW5aIstNUSjtjP-4msTYr6P0hmJA8e6Kes8MN-PvtiZIZlmjn7lng')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/90 via-surface-container-lowest/80 to-surface-container-lowest/95 backdrop-blur-[4px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0c0e12_85%)]"></div>
      </div>
      
      {/* Header */}
      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start pt-10 pb-margin">
        
        {/* HERO */}
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pt-4 pb-12 flex flex-col gap-space-md border-b border-surface-container-high/50 mb-10">
          <div className="inline-flex items-center gap-2 px-space-md py-1 rounded-full border border-primary-container/30 bg-primary-container/5 backdrop-blur-md self-start">
            <span className="material-symbols-outlined text-[16px] text-primary-container">sports_esports</span>
            <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Global Scrimmage Directory</span>
          </div>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl uppercase text-on-surface tracking-tighter">
            Tournaments
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Live telemetry of upcoming battles and historical data from past victories.
          </p>
        </section>

        <div className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin flex flex-col gap-space-xl">
          
          {/* Active Tournaments */}
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary-container text-[24px]">radar</span>
              <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">Active Scrims</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
              {activeTournaments.length === 0 ? (
                <div className="col-span-full p-8 text-center border border-surface-container-high border-dashed rounded-xl text-outline font-mono text-sm">
                  No active operations detected.
                </div>
              ) : (
                activeTournaments.map((t: any) => (
                  <div key={t.id} className="bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl overflow-hidden hover:border-primary-container/50 transition-colors group relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
                    <div className="p-space-lg flex flex-col gap-space-md">
                      
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <h3 className="font-title-lg text-xl font-bold text-on-surface mb-1 uppercase tracking-wider">{t.name}</h3>
                          <div className="flex items-center gap-3 text-outline font-mono text-[11px]">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {new Date(t.tournamentDate).toLocaleDateString()}</span>
                            <span>{t.mode} | {t.teamSize}v{t.teamSize}</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-mono rounded border border-red-500/20 uppercase tracking-widest">
                          {t.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-outline">Confirmed Operators</span>
                          <span className="text-primary-container">{t._count.participants} / {t.maxPlayers}</span>
                        </div>
                        <div className="w-full bg-surface-container-highest rounded-full h-1 border border-surface-container-high/50 overflow-hidden">
                          <div className="bg-primary-container h-full" style={{ width: `${Math.min((t._count.participants/t.maxPlayers)*100, 100)}%` }}></div>
                        </div>
                      </div>
                      
                      <Link href={`/tournaments/${t.id}`} className="w-full py-3 bg-surface-container-highest/50 border border-surface-container-high rounded-lg text-outline hover:text-on-surface font-label-sm uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-primary-container/30 transition-colors mt-2">
                        Enter Terminal <span className="material-symbols-outlined text-[16px]">terminal</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Results */}
          <div className="flex flex-col gap-space-md mt-10">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary-container text-[24px]">workspace_premium</span>
              <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">Historical Data</h2>
            </div>
            
            <div className="flex flex-col gap-space-sm">
              {pastTournaments.length === 0 ? (
                 <div className="p-8 text-center border border-surface-container-high border-dashed rounded-xl text-outline font-mono text-sm">
                   Archive empty.
                 </div>
              ) : (
                pastTournaments.map((t: any) => (
                  <div key={t.id} className="bg-surface-container-low/60 backdrop-blur-xl border border-surface-container-high rounded-xl overflow-hidden hover:bg-surface-container-low transition-colors">
                    <div className="p-space-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex flex-col">
                        <h3 className="font-title-md text-on-surface uppercase tracking-wider">{t.name}</h3>
                        <p className="text-outline font-mono text-[10px] mt-1">LOGGED ON: {new Date(t.tournamentDate).toLocaleDateString()} • {t.mode}</p>
                      </div>
                      <Link href={`/tournaments/${t.id}/results`} className="px-4 py-2 bg-surface-container-highest border border-surface-container-high hover:border-primary-container rounded-lg transition-colors font-label-sm uppercase tracking-widest text-outline hover:text-primary-container">
                        View Standings
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-10 w-full px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-surface-container-high/30 bg-surface-container-lowest mt-10">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[16px] text-outline">verified_user</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">BP Tactical Directives Enforced</span>
        </div>
        <div className="flex items-center gap-space-md">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">© 2026 BP Black Panthers Esports</span>
        </div>
      </footer>
    </div>
  );
}
