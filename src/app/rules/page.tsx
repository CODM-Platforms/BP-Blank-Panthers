import GlobalHeader from '@/components/GlobalHeader';
import ClanBackground from '@/components/ClanBackground';

const CLAN_RULES = [
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
      'The clan is a team — not everyone doing their own thing.',
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
      'Follow the targets and strategy set by the leaders.',
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
      'Follow leader coordination during Clan Wars and events.',
    ],
  },
];

export default function RulesPage() {
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
            <span className="material-symbols-outlined text-[16px] text-primary-container">gavel</span>
            <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Clan Directives</span>
          </div>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl uppercase text-on-surface tracking-tighter">
            Rules
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Code of conduct and operational directives required of every BP Black Panthers operator.
          </p>
        </section>

        {/* RULES / DIRECTIVES SECTION */}
        <section id="rules" className="w-full max-w-6xl mx-auto px-margin-mobile md:px-margin">
          <div className="bg-surface-container-low/60 backdrop-blur-xl border border-surface-container-high rounded-2xl p-space-lg md:p-space-xl flex flex-col gap-space-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>

            <div className="flex flex-col gap-space-sm">
              <span className="font-label-sm text-label-sm text-primary-container tracking-widest uppercase">Mandatory Protocol</span>
              <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">
                BP Black Panthers CODM &mdash; Rules
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Led by <span className="text-on-surface font-bold">GUITZY</span>,{' '}
                <span className="text-on-surface font-bold">CRADY</span>, and{' '}
                <span className="text-on-surface font-bold">LENXON</span>.
              </p>
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
              {CLAN_RULES.map((rule) => (
                <div
                  key={rule.title}
                  className="flex items-start gap-space-sm bg-surface-container-lowest/60 border border-surface-container-high rounded-xl p-space-md"
                >
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

