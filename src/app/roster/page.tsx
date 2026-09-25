
import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { db } from '@/prisma/db';

export default async function PublicRoster() {
  let members: any[] = [];
  try {
    members = await db.orm.public.Member
      .where({ status: 'ACTIVE' })
      .orderBy((m) => m.tournamentsAttended.desc())
      .all();
  } catch (e) {
    console.error("DB error", e);
  }

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
            <span className="material-symbols-outlined text-[16px] text-primary-container">groups</span>
            <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Operator Database</span>
          </div>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl uppercase text-on-surface tracking-tighter flex items-center gap-4">
            Roster
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Official active lineup of the BP Black Panthers division.
          </p>
        </section>

        <div className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-md">
            {members.length === 0 ? (
              <div className="col-span-full p-8 text-center border border-surface-container-high border-dashed rounded-xl text-outline font-mono text-sm">
                No active operators found in the database.
              </div>
            ) : (
              members.map((member: any) => (
                <Link href={`/player/${member.codmUsername}`} key={member.id} className="bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl overflow-hidden hover:border-primary-container/50 transition-all hover:-translate-y-1 group relative flex flex-col">
                  <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-highest group-hover:bg-primary-container transition-colors z-10"></div>
                  
                  <div className="aspect-square bg-surface-container-lowest relative border-b border-surface-container-high flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent z-10"></div>
                    {member.profilePicture ? (
                      <img src={member.profilePicture} alt={member.codmUsername} className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-70 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal" />
                    ) : (
                      <span className="material-symbols-outlined text-[64px] text-surface-container-highest group-hover:text-primary-container/30 transition-colors z-0">person</span>
                    )}
                  </div>
                  
                  <div className="p-space-md text-center flex flex-col gap-2 relative z-20 -mt-8 bg-surface-container-lowest/80 backdrop-blur-md mx-space-sm rounded-lg border border-surface-container-high shadow-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface truncate">{member.codmUsername}</h3>
                    <p className="font-label-sm text-label-sm text-primary-container uppercase font-mono tracking-widest">{member.preferredMode}</p>
                    
                    <div className="flex justify-between mt-2 pt-2 border-t border-surface-container-high/50">
                      <div className="text-center flex-1">
                        <span className="block text-[9px] text-outline uppercase font-mono tracking-widest">Deployments</span>
                        <span className="block font-title-sm text-on-surface flex items-center justify-center gap-1 mt-1"><span className="material-symbols-outlined text-[12px] text-primary-container">workspace_premium</span> {member.tournamentsAttended}</span>
                      </div>
                      <div className="text-center flex-1 border-l border-surface-container-high/50">
                        <span className="block text-[9px] text-outline uppercase font-mono tracking-widest">Region</span>
                        <span className="block font-title-sm text-on-surface mt-1">{member.region}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
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
