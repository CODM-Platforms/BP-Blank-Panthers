import { Users, GripVertical, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/prisma/db';

export default async function ManualTeamBuilder({ params }: { params: { id: string } }) {
  let unassigned = [];
  let teams = [];
  let tournament = null;

  try {
    tournament = await db.tournament.findUnique({ where: { id: params.id } });
    
    // Players who confirmed but don't have a team yet
    unassigned = await db.participant.findMany({
      where: { tournamentId: params.id, attendanceStatus: 'CONFIRMED', teamId: null },
      include: { member: true }
    });

    // Existing teams and their players
    teams = await db.team.findMany({
      where: { tournamentId: params.id },
      include: { participants: { include: { member: true } } }
    });
  } catch(e) {
    console.error("DB error");
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href={`/admin/tournaments/${params.id}`} className="text-sm text-panther-text hover:text-panther-gold mb-2 inline-block">
            &larr; Back to Tournament
          </Link>
          <h1 className="text-3xl font-bold text-white uppercase">Team Builder</h1>
          <p className="text-panther-text mt-1">{tournament?.name || 'Tournament'} - Construct squads manually.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-panther-border text-panther-text hover:text-white rounded-lg transition-colors">
            Auto-Generate Rest
          </button>
          <button className="px-4 py-2 bg-panther-gold text-panther-dark font-bold rounded-lg hover:bg-panther-gold-hover transition-colors shadow-[0_0_15px_rgba(230,200,117,0.3)]">
            Save Teams & Notify
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Unassigned Pool */}
        <div className="bg-panther-card border border-panther-border rounded-xl p-6 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-6 border-b border-panther-border pb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-panther-gold" /> Unassigned
            </h2>
            <span className="px-2 py-1 bg-panther-dark rounded text-xs font-mono text-panther-gold border border-panther-border">{unassigned.length} Left</span>
          </div>

          <div className="space-y-3">
            {unassigned.length === 0 ? (
              <p className="text-sm text-panther-text italic">No unassigned players.</p>
            ) : (
              unassigned.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-panther-dark border border-panther-border rounded-lg cursor-grab hover:border-panther-gold/50 transition-colors">
                  <GripVertical className="w-4 h-4 text-panther-text" />
                  <div>
                    <p className="text-sm font-bold text-white">{p.member.fullName}</p>
                    <p className="text-xs text-panther-text font-mono">UID: {p.member.codmUid.slice(0, 4)}***</p>
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
               <div className="col-span-full p-8 text-center border border-panther-border border-dashed rounded-xl text-panther-text">
                 No teams created yet. Click Auto-Generate or Create Team to begin.
               </div>
            ) : (
              teams.map((team, idx) => (
                <div key={team.id} className="bg-panther-card border border-panther-border rounded-xl overflow-hidden">
                  <div className="p-4 bg-panther-dark border-b border-panther-border flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">{team.name}</h3>
                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                      {team.participants.length}/{tournament?.teamSize || 4}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    {team.participants.map((p, seat) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-panther-dark border border-panther-border rounded-lg cursor-grab">
                        <GripVertical className="w-4 h-4 text-panther-text" />
                        <div className="w-6 h-6 rounded bg-panther-card border border-panther-border flex items-center justify-center text-xs text-panther-text font-mono">{seat + 1}</div>
                        <div><p className="text-sm font-bold text-white">{p.member.fullName}</p></div>
                      </div>
                    ))}
                    {/* Empty Slots */}
                    {Array.from({ length: (tournament?.teamSize || 4) - team.participants.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex items-center gap-3 p-3 bg-panther-dark/30 border border-panther-border border-dashed rounded-lg min-h-[4rem]">
                        <div className="w-6 h-6 rounded bg-panther-card border border-panther-border flex items-center justify-center text-xs text-panther-text font-mono opacity-50">
                          {team.participants.length + i + 1}
                        </div>
                        <p className="text-xs text-panther-text italic">Drop player here...</p>
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
