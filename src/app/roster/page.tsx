import GlobalHeader from '@/components/GlobalHeader';
import ClanBackground from '@/components/ClanBackground';
import RosterClient from '@/components/RosterClient';
import { db } from '@/prisma/db';
import { CLAN_TAG } from '@/config/clan';

// See src/app/page.tsx - without this, Next prerenders the roster once at
// build time and Vercel serves that frozen snapshot until the next deploy.
export const dynamic = 'force-dynamic';

export default async function PublicRoster() {
  let members: any[] = [];
  try {
    members = await db.orm.public.Member
      .where({ status: 'ACTIVE' })
      .orderBy((m) => m.tournamentsAttended.desc())
      .all();
  } catch (e) {
    console.error('DB error', e);
  }

  const serializedMembers = members.map((m: any) => ({
    id: m.id,
    fullName: m.fullName,
    codmUsername: m.codmUsername,
    preferredMode: m.preferredMode,
    codmClass: m.codmClass ?? null,
    region: m.region,
    country: m.country,
    tournamentsAttended: m.tournamentsAttended ?? 0,
    profilePicture: m.profilePicture ?? null,
  }));

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Graphic */}
      <ClanBackground />

      {/* Header */}
      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start pt-10 pb-margin">
        {/* HERO */}
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pt-4 pb-8 flex flex-col gap-space-sm border-b border-surface-container-high/50 mb-8">
          <div className="inline-flex items-center gap-2 px-space-md py-1 rounded-full border border-primary-container/30 bg-primary-container/5 backdrop-blur-md self-start">
            <span className="material-symbols-outlined text-[16px] text-primary-container">groups</span>
            <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">
              Active Members ({serializedMembers.length})
            </span>
          </div>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl uppercase text-on-surface tracking-tighter flex items-center gap-4">
            Clan Roster
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Official active lineup of BP Black Panthers ({CLAN_TAG}).
          </p>
        </section>

        <div className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin">
          <RosterClient members={serializedMembers} />
        </div>
      </main>

      <footer className="relative z-10 w-full px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-surface-container-high/30 bg-surface-container-lowest mt-10">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[16px] text-outline">verified_user</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">{CLAN_TAG} • BP Black Panthers CODM</span>
        </div>
        <div className="flex items-center gap-space-md">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">© 2026 BP Black Panthers Esports</span>
        </div>
      </footer>
    </div>
  );
}
