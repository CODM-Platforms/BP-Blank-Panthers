import { Users, GripVertical, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/prisma/db';

export default async function ManualTeamBuilder({ params }: { params: { id: string } }) {
  let unassigned: any[] = [];
  let teams: any[] = [];
  let tournament: any = null;

  try {
    tournament = await db.orm.public.Tournament.first({ id: params.id });

    // Players who confirmed but don't have a team yet
    unassigned = await db.orm.public.Participant
      .where((p) => p.tournamentId.eq(params.id))
      .where((p) => p.attendanceStatus.eq('CONFIRMED'))
      .where((p) => p.teamId.isNull())
      .include('member', (m) => m)
      .all();

    // Existing teams and their players
    teams = await db.orm.public.Team
      .where({ tournamentId: params.id })
      .include('participants', (p) => p.include('member', (m) => m))
      .all();
  } catch(e) {
    console.error("DB error");
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href={`/admin/tournaments/${params.id}`} className="text-sm text-outline hover:text-primary-container mb-2 inline-block">
            &larr; Back to Tournament
          </Link>
          <h1 className="text-3xl font-bold text-on-surface uppercase">Team Builder</h1>
          <p className="text-outline mt-1">{tournament?.name || 'Tournament'} - Construct squads manually.</p>
        </div>
        <div className="flex gap-3">
          <button disabled title="Not built yet" className="px-4 py-2 border border-surface-container-high text-outline/40 rounded-lg cursor-not-allowed">
            Auto-Generate Rest
          </button>
          <button disabled title="Not built yet - drag-and-drop team assignment is on the roadmap" className="px-4 py-2 bg-primary-container/30 text-surface-container-lowest/50 font-bold rounded-lg cursor-not-allowed">
            Save Teams
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Unassigned Pool */}
        <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-6 border-b border-surface-container-high pb-4">
            <h2 className="font-bold text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-container" /> Unassigned
            </h2>
            <span className="px-2 py-1 bg-surface-container-lowest rounded text-xs font-mono text-primary-container border border-surface-container-high">{unassigned.length} Left</span>
          </div>

          <div className="space-y-3">
            {unassigned.length === 0 ? (
              <p className="text-sm text-outline italic">No unassigned players.</p>
            ) : (
              unassigned.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-surface-container-high rounded-lg cursor-grab hover:border-primary-container/50 transition-colors">
                  <GripVertical className="w-4 h-4 text-outline" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">{p.member.fullName}</p>
                    <p className="text-xs text-outline font-mono">UID: {p.member.codmUid.slice(0, 4)}***</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Squads Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-3 text-sm text-blue-200">
            <ShieldAlert className="w-5 h-5 shrink-0 text-blue-400" />
            <p>Drag players from the unassigned pool into the squads below. Each squad requires {tournament?.teamSize || 4} players.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.length === 0 ? (
               <div className="col-span-full p-8 text-center border border-surface-container-high border-dashed rounded-xl text-outline">
                 No teams created yet. Click Auto-Generate or Create Team to begin.
               </div>
            ) : (
              teams.map((team, idx) => (
                <div key={team.id} className="bg-surface-container-low border border-surface-container-high rounded-xl overflow-hidden">
                  <div className="p-4 bg-surface-container-lowest border-b border-surface-container-high flex justify-between items-center">
                    <h3 className="font-bold text-on-surface text-lg">{team.name}</h3>
                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                      {team.participants.length}/{tournament?.teamSize || 4}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    {team.participants.map((p: any, seat: number) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-surface-container-high rounded-lg cursor-grab">
                        <GripVertical className="w-4 h-4 text-outline" />
                        <div className="w-6 h-6 rounded bg-surface-container-low border border-surface-container-high flex items-center justify-center text-xs text-outline font-mono">{seat + 1}</div>
                        <div><p className="text-sm font-bold text-on-surface">{p.member.fullName}</p></div>
                      </div>
                    ))}
                    {/* Empty Slots */}
                    {Array.from({ length: (tournament?.teamSize || 4) - team.participants.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex items-center gap-3 p-3 bg-surface-container-lowest/30 border border-surface-container-high border-dashed rounded-lg min-h-[4rem]">
                        <div className="w-6 h-6 rounded bg-surface-container-low border border-surface-container-high flex items-center justify-center text-xs text-outline font-mono opacity-50">
                          {team.participants.length + i + 1}
                        </div>
                        <p className="text-xs text-outline italic">Drop player here...</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
