
import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { db } from '@/prisma/db';
import { toJsDate } from '@/lib/temporal';

// No dynamic route segment and no cookies()/headers() call here, so Next
// would otherwise prerender this once at build time and Vercel would keep
// serving that frozen snapshot forever - roster/tournament/post changes
// (including a direct DB fix) would never show up without a full redeploy.
export const dynamic = 'force-dynamic';

function loadActiveTournaments() {
  return db.orm.public.Tournament
    .where({ status: 'PUBLISHED' })
    .orderBy((t) => t.tournamentDate.asc())
    .limit(2)
    .include('participants', (p) => p.count())
    .all();
}

function loadRecentPosts() {
  return db.orm.public.Post
    .where({ category: 'NEWS' })
    .orderBy((p) => p.createdAt.desc())
    .limit(2)
    .all();
}

async function loadSpotlightTournament() {
  const completed = await db.orm.public.Tournament
    .where({ status: 'COMPLETED' })
    .orderBy((t) => t.tournamentDate.desc())
    .limit(1)
    .include('teams', (team) =>
      team
        .orderBy((t) => t.placement.asc())
        .limit(1)
        .include('participants', (p) => p.include('member', (m) => m)),
    )
    .all();
  if (completed.length === 0) return null;
  return completed[0];
}

function loadClanLeaders() {
  return db.orm.public.User
    .where((u) => u.role.in(['SUPER_ADMIN', 'CLAN_MASTER']))
    .orderBy((u) => u.createdAt.asc())
    .limit(4)
    .include('member', (m) => m)
    .all();
}

export default async function Home() {
  let activeTournaments: Awaited<ReturnType<typeof loadActiveTournaments>> = [];
  let recentPosts: Awaited<ReturnType<typeof loadRecentPosts>> = [];
  let spotlightTournament: Awaited<ReturnType<typeof loadSpotlightTournament>> = null;
  let clanLeaders: Awaited<ReturnType<typeof loadClanLeaders>> = [];

  try {
    activeTournaments = await loadActiveTournaments();
    recentPosts = await loadRecentPosts();
    spotlightTournament = await loadSpotlightTournament();
    clanLeaders = await loadClanLeaders();
  } catch(e) {
    console.error("DB not connected yet.");
  }

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Background Graphic */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 filter contrast-125 saturate-50 scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-9rTGcur1BRSQSmqEmNfM2OrWE8PDOIgAweVjC7yOz6s6kHmLE08ElDVIdVTG-HLfn7RBP-Lw6rCqPYQTtI4SXgeQ0pwzZoEXAYOBzZqSgtWHyqqXy8xgIDy9RZ5wEA7Ud5Jv_sr720Ar2MgacpEkAOxurNZa4cRB3AgShwrQ_wgfY7Vi8kD3N5OIi8pAofbKAyW5aIstNUSjtjP-4msTYr6P0hmJA8e6Kes8MN-PvtiZIZlmjn7lng')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/90 via-surface-container-lowest/80 to-surface-container-lowest/95 backdrop-blur-[4px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0c0e12_85%)]"></div>
      </div>
      
      {/* Header */}
      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start pt-10 pb-margin">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pt-10 pb-20 flex flex-col items-center text-center gap-space-lg">
          <div className="inline-flex items-center gap-2 px-space-md py-1 rounded-full border border-primary-container/30 bg-primary-container/5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-ping absolute"></span>
            <span className="w-2 h-2 rounded-full bg-primary-container relative"></span>
            <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Elite CODM Division</span>
          </div>
          
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl uppercase text-on-surface tracking-tighter">
            Dominate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-container to-primary-fixed-dim">The Grid</span>
          </h1>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            BP Black Panthers is a premier Call of Duty: Mobile esports organization. Join the ranks, compete in top-tier tournaments, and forge your legacy.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-space-md mt-space-sm">
            <Link href="/join" className="group py-space-md px-space-xl rounded-lg bg-primary-container hover:bg-primary-fixed-dim active:scale-[0.99] text-on-primary-container font-headline-sm text-headline-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-space-sm shadow-[0_0_24px_rgba(255,59,59,0.2)] hover:shadow-[0_0_32px_rgba(255,59,59,0.35)]">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span>Submit Combine Dossier</span>
            </Link>
            <Link href="/roster" className="group py-space-md px-space-xl rounded-lg bg-surface-container-high hover:bg-surface-container-highest active:scale-[0.99] text-on-surface font-headline-sm text-headline-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-space-sm border border-outline/30">
              <span className="material-symbols-outlined text-[20px]">groups</span>
              <span>View Roster</span>
            </Link>
          </div>
        </section>

        {/* ABOUT / MISSION SECTION */}
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pb-20">
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
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Show up prepared, communicate on comms, own your role in every match.</span>
                </div>
              </div>
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[22px]">groups</span>
                <div className="flex flex-col">
                  <span className="font-title-sm text-title-sm text-on-surface uppercase tracking-wide">Brotherhood</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">The clan tag means something. We back each other on and off the grid.</span>
                </div>
              </div>
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-primary-container text-[22px]">emoji_events</span>
                <div className="flex flex-col">
                  <span className="font-title-sm text-title-sm text-on-surface uppercase tracking-wide">Dominance</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">We play to win every scrim, every tournament, every time we queue up.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RULES / DIRECTIVES SECTION */}
        <section id="rules" className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin pb-20 scroll-mt-24">
          <div className="bg-surface-container-low/60 backdrop-blur-xl border border-surface-container-high rounded-2xl p-space-lg md:p-space-xl flex flex-col gap-space-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>

            <div className="flex flex-col gap-space-sm">
              <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Clan Directives</span>
              <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">BP Black Panthers CODM &mdash; Rules</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Led by <span className="text-on-surface font-bold">GUITZY</span>, <span className="text-on-surface font-bold">CRADY</span>, and <span className="text-on-surface font-bold">LENXON</span>.</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed max-w-3xl mt-2">
                Every member is required to carry the <span className="font-mono text-primary-container">ẞP.ঐ</span> tag in their in-game
                username and send a join request to the clan inside the game itself. Failure to do either can result in removal.
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed max-w-3xl">
                Our clan is built on unity, respect, communication, and honest competition. Every member represents the
                Black Panthers name &mdash; inside the game and outside it.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-sm border-t border-surface-container-high/50">
              {[
                {
                  icon: 'handshake',
                  title: '1. Respect',
                  points: [
                    'Respect every member regardless of level, rank, or skill.',
                    'No insults, disrespect, discrimination, or harassment.',
                    "Don't settle conflicts with arguments — bring them to a clan leader.",
                  ],
                },
                {
                  icon: 'groups',
                  title: '2. Teamwork',
                  points: [
                    "The clan is a team — not everyone doing their own thing.",
                    'Support your clanmates in Ranked, BR/MP matches, and Clan Wars.',
                    "Don't leave a teammate behind when they need help.",
                  ],
                },
                {
                  icon: 'mic',
                  title: '3. Communication',
                  points: [
                    'Communicate clearly with teammates during battle.',
                    'Use voice chat or clan comms when it matters.',
                    'Call out enemy positions, objectives, and strategy.',
                  ],
                },
                {
                  icon: 'swords',
                  title: '4. Clan Wars',
                  points: [
                    'Members who are able to are strongly encouraged to join Clan Wars.',
                    "When you're active during Clan Wars, contribute points to the clan.",
                    "Follow the targets and strategy set by the leaders.",
                  ],
                },
                {
                  icon: 'local_fire_department',
                  title: '5. Stay Active',
                  points: [
                    'We value members who show up and participate regularly.',
                    "Let a leader know if you'll be unavailable for a while, when possible.",
                    'Unexplained inactivity may cost you your spot on the roster.',
                  ],
                },
                {
                  icon: 'block',
                  title: '6. No Toxicity',
                  points: [
                    'Trash talking teammates is not allowed.',
                    'No provoking or starting drama.',
                    'No offensive or hateful language, cheating, or exploiting.',
                  ],
                },
                {
                  icon: 'pets',
                  title: '7. Loyalty',
                  points: [
                    "Don't misuse the ẞP.ঐ name.",
                    'Represent the Black Panthers name with respect in other matches and communities.',
                    "Don't bring other clans' drama into Black Panthers.",
                  ],
                },
                {
                  icon: 'shield_person',
                  title: '8. Leadership',
                  points: [
                    'Respect the decisions of the Clan Leaders.',
                    'Raise problems or suggestions with the leaders instead of starting conflict.',
                    "Follow leader coordination during Clan Wars and events.",
                  ],
                },
              ].map((rule) => (
                <div key={rule.title} className="flex items-start gap-space-sm bg-surface-container-lowest/60 border border-surface-container-high rounded-xl p-space-md">
                  <span className="material-symbols-outlined text-primary-container text-[22px] shrink-0">{rule.icon}</span>
                  <div className="flex flex-col gap-1">
                    <span className="font-title-sm text-title-sm text-on-surface uppercase tracking-wide">{rule.title}</span>
                    <ul className="font-body-sm text-body-sm text-on-surface-variant list-disc list-inside space-y-1 mt-1">
                      {rule.points.map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin grid grid-cols-1 lg:grid-cols-3 gap-space-xl">

          {/* LEFT COLUMN: Spotlight Tournament */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary-container text-[24px]">workspace_premium</span>
              <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">Recent Victory</h2>
            </div>
            
            <div className="bg-surface-container-low/80 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-surface-container-high relative p-space-lg md:p-space-xl flex flex-col gap-space-md h-full">
              <div className="h-1 w-full absolute top-0 left-0 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80"></div>
              
              {spotlightTournament ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono">SYS.ID: {spotlightTournament.id.slice(-6)}</span>
                    <h3 className="font-headline-lg text-headline-lg uppercase text-on-surface text-[28px] mt-2">{spotlightTournament.name}</h3>
                    <p className="font-body-md text-body-md text-primary-container mt-1">{spotlightTournament.mode} • {toJsDate(spotlightTournament.tournamentDate).toLocaleDateString()}</p>
                  </div>
                  
                  {spotlightTournament.teams && spotlightTournament.teams.length > 0 && (
                    <div className="mt-4 bg-surface-container-lowest border border-outline/30 rounded-lg p-space-md flex flex-col gap-space-sm">
                      <div className="flex justify-between items-center border-b border-surface-container-high pb-2">
                        <span className="font-title-md text-title-md text-on-surface uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary-container">emoji_events</span>
                          {spotlightTournament.teams[0].name} (1st Place)
                        </span>
                        <span className="font-mono text-xl text-primary-container">{spotlightTournament.teams[0].totalPoints} Pts</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {spotlightTournament.teams[0].participants.map((p: any) => (
                          <span key={p.id} className="px-2 py-1 bg-surface-container-high border border-outline/20 rounded font-mono text-[11px] text-on-surface">
                            {p.member.codmUsername}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-outline opacity-60">
                  <span className="material-symbols-outlined text-[48px] mb-4">military_tech</span>
                  <p className="font-body-md uppercase tracking-widest">No recent victories recorded.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Active / News */}
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary-container text-[24px]">radar</span>
              <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">Active Intel</h2>
            </div>
            
            <div className="flex flex-col gap-space-sm h-full">
              {activeTournaments.length > 0 ? activeTournaments.map((t: any) => (
                <div key={t.id} className="bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl p-space-md flex items-center justify-between hover:border-primary-container/50 transition-colors group">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono text-[9px] mb-1">UPCOMING SCIRM</span>
                    <span className="font-title-md text-title-md text-on-surface">{t.name}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t.mode} • {t.participants}/{t.maxPlayers} Ops</span>
                  </div>
                  <Link href={"/tournaments/" + t.id} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              )) : (
                <div className="bg-surface-container-low/50 border border-surface-container-high border-dashed rounded-xl p-space-md text-outline text-center text-sm">
                  No active scrambles scheduled.
                </div>
              )}

              {recentPosts.length > 0 ? recentPosts.map((post: any) => (
                <div key={post.id} className="bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl p-space-md flex items-center justify-between hover:border-primary-container/50 transition-colors group">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono text-[9px] mb-1">LATEST INTEL</span>
                    <span className="font-title-sm text-title-sm text-on-surface line-clamp-1">{post.title}</span>
                  </div>
                  <Link href={"/news/" + post.id} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                    <span className="material-symbols-outlined">article</span>
                  </Link>
                </div>
              )) : null}
            </div>
          </div>
        </div>

        {/* COMMAND ROSTER SECTION */}
        <section className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin mt-20 pt-10 border-t border-surface-container-high/50">
          <div className="flex items-center justify-center gap-space-sm mb-10">
            <span className="material-symbols-outlined text-primary-container text-[28px]">shield_person</span>
            <h2 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight">Command Roster</h2>
          </div>
          
          {clanLeaders.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-lg">
              {clanLeaders.map((leader: any) => (
                <div key={leader.id} className="bg-surface-container-low/60 backdrop-blur-md border border-surface-container-high rounded-2xl p-space-lg text-center hover:border-primary-container/40 transition-all hover:-translate-y-1">
                  <div className="w-20 h-20 mx-auto bg-surface-container-lowest rounded-full border border-primary-container/50 mb-4 flex items-center justify-center overflow-hidden">
                     {leader.member?.profilePicture ? (
                       <img src={leader.member.profilePicture} alt={leader.name} className="w-full h-full object-cover" />
                     ) : (
                       <span className="material-symbols-outlined text-[32px] text-primary-container">shield</span>
                     )}
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 uppercase">{leader.name}</h3>
                  <p className="font-label-sm text-label-sm text-primary-container uppercase tracking-widest">{leader.role.replace('_', ' ')}</p>
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
      
      <footer className="relative z-10 w-full px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-surface-container-high/30 bg-surface-container-lowest">
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
