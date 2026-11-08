import GlobalHeader from '@/components/GlobalHeader';
import ClanBackground from '@/components/ClanBackground';
import { db } from '@/prisma/db';

// See src/app/page.tsx - without this, Next prerenders this page once at
// build time and Vercel serves that frozen snapshot until the next deploy.
export const dynamic = 'force-dynamic';

function loadClanLeaders() {
  return db.orm.public.User
    .where((u) => u.role.in(['SUPER_ADMIN', 'CLAN_MASTER']))
    .orderBy((u) => u.createdAt.asc())
    .limit(4)
    .include('member', (m) => m)
    .all();
}

export default async function AboutPage() {
  let clanLeaders: Awaited<ReturnType<typeof loadClanLeaders>> = [];

  try {
    clanLeaders = await loadClanLeaders();
  } catch (e) {
    console.error('About DB query error:', e);
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Graphic */}
      <ClanBackground />

      {/* Header */}
      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start pt-10 pb-margin">
        {/* HERO */}
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pt-4 pb-12 flex flex-col gap-space-md border-b border-surface-container-high/50 mb-10">
          <div className="inline-flex items-center gap-2 px-space-md py-1 rounded-full border border-primary-container/30 bg-primary-container/5 backdrop-blur-md self-start">
            <span className="material-symbols-outlined text-[16px] text-primary-container">shield</span>
            <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Division Identity</span>
          </div>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl uppercase text-on-surface tracking-tighter">
            About Us
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Our origins, core pillars, and the leadership command behind BP Black Panthers.
          </p>
        </section>

        {/* ABOUT / MISSION SECTION */}
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pb-16">
          <div className="bg-surface-container-low/60 backdrop-blur-xl border border-surface-container-high rounded-2xl p-space-lg md:p-space-xl flex flex-col gap-space-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>

            <div className="flex flex-col gap-space-sm max-w-3xl">
              <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Who We Are</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                BP Black Panthers was founded in Tanzania by GUITZY, CRADY, and LENXON &mdash; three operators
                who treat Call of Duty: Mobile as a craft, not a pastime. This is a roster of disciplined players
                who show up, communicate, and compete like it matters &mdash; because to us, it does.
                We recruit for attitude first: reliability, respect for the squad, and a refusal to coast.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-sm border-t border-surface-container-high/50">
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[22px]">military_tech</span>
                <div className="flex flex-col">
                  <span className="font-title-sm text-title-sm text-on-surface uppercase tracking-wide">Discipline</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Show up prepared, communicate on comms, own your role in every match.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[22px]">groups</span>
                <div className="flex flex-col">
                  <span className="font-title-sm text-title-sm text-on-surface uppercase tracking-wide">Brotherhood</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    The clan tag means something. We back each other on and off the grid.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[22px]">emoji_events</span>
                <div className="flex flex-col">
                  <span className="font-title-sm text-title-sm text-on-surface uppercase tracking-wide">Dominance</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    We play to win every scrim, every tournament, every time we queue up.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMMAND ROSTER SECTION */}
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pt-6 border-t border-surface-container-high/50">
          <div className="flex items-center justify-center gap-space-sm mb-10">
            <span className="material-symbols-outlined text-primary-container text-[28px]">shield_person</span>
            <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight">Command Roster</h2>
          </div>

          {clanLeaders.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-lg">
              {clanLeaders.map((leader: any) => (
                <div
                  key={leader.id}
                  className="bg-surface-container-low/60 backdrop-blur-md border border-surface-container-high rounded-2xl p-space-lg text-center hover:border-primary-container/40 transition-all hover:-translate-y-1"
                >
                  <div className="w-20 h-20 mx-auto bg-surface-container-lowest rounded-full border border-primary-container/50 mb-4 flex items-center justify-center overflow-hidden">
                    {leader.member?.profilePicture ? (
                      <img src={leader.member.profilePicture} alt={leader.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-[32px] text-primary-container">shield</span>
                    )}
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 uppercase">{leader.name}</h3>
                  <p className="font-label-sm text-label-sm text-primary-container uppercase tracking-widest">
                    {leader.role.replace('_', ' ')}
                  </p>
                  {leader.member?.codmUsername && (
                    <p className="font-mono text-[11px] text-outline mt-1">{leader.member.codmUsername}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-outline p-8 border border-surface-container-high border-dashed rounded-xl max-w-2xl mx-auto">
              Command Roster will appear here once Admins initialize.
            </div>
          )}
        </section>
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

