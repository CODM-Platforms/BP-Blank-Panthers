
import { Users, Trophy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/prisma/db';

export default async function AdminDashboard() {
  const stats = { total: 0, active: 0, pending: 0, suspended: 0, activeTournaments: 0 };
  let upcomingTournament: any = null;
  let pendingMembers: any[] = [];

  try {
    const members = await db.orm.public.Member.all();
    stats.total = members.length;
    stats.active = members.filter((m: any) => m.status === 'ACTIVE').length;
    stats.pending = members.filter((m: any) => m.status === 'PENDING').length;
    stats.suspended = members.filter((m: any) => m.status === 'SUSPENDED').length;

    const tournaments = await db.orm.public.Tournament
      .where((t) => t.status.in(['PUBLISHED', 'ONGOING']))
      .orderBy((t) => t.tournamentDate.asc())
      .include('participants', (p) => p.where((pp) => pp.attendanceStatus.eq('CONFIRMED')).count())
      .all();
    stats.activeTournaments = tournaments.length;
    
    if (tournaments.length > 0) {
      upcomingTournament = tournaments[0];
    }

    pendingMembers = members.filter((m: any) => m.status === 'PENDING').slice(0, 5);
  } catch (e) {
    console.error("DB error", e);
  }

  return (
    <div className="space-y-space-lg animate-fade-in relative z-10">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
        
        {/* Total Members */}
        <div className="bg-surface-container-low/80 backdrop-blur-md border border-surface-container-high rounded-xl p-space-md flex flex-col hover:border-primary-container/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label-sm text-label-sm tracking-widest text-outline uppercase">Total Operators</h3>
            <div className="p-2 bg-surface-container-highest rounded-lg border border-surface-container-high group-hover:border-primary-container/30 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-primary-container">groups</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">{stats.total}</div>
          <p className="font-body-sm text-body-sm text-primary-container mt-2 flex items-center">
            <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span> {stats.active} Active duty
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-surface-container-low/80 backdrop-blur-md border border-surface-container-high rounded-xl p-space-md flex flex-col hover:border-error/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label-sm text-label-sm tracking-widest text-outline uppercase">Pending Dossiers</h3>
            <div className="p-2 bg-surface-container-highest rounded-lg border border-surface-container-high group-hover:border-error/30 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-error">pending_actions</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">{stats.pending}</div>
          <p className="font-body-sm text-body-sm text-error mt-2 flex items-center">
            <span className="material-symbols-outlined text-[14px] mr-1">warning</span> Requires review
          </p>
        </div>

        {/* Active Tournaments */}
        <div className="bg-surface-container-low/80 backdrop-blur-md border border-surface-container-high rounded-xl p-space-md flex flex-col hover:border-primary-container/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label-sm text-label-sm tracking-widest text-outline uppercase">Active Operations</h3>
            <div className="p-2 bg-surface-container-highest rounded-lg border border-surface-container-high group-hover:border-primary-container/30 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-primary-container">radar</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">{stats.activeTournaments}</div>
          <p className="font-body-sm text-body-sm text-outline mt-2 truncate">
            {upcomingTournament ? `Next: ${upcomingTournament.name}` : 'No upcoming intel'}
          </p>
        </div>

        {/* Suspended */}
        <div className="bg-surface-container-low/80 backdrop-blur-md border border-surface-container-high rounded-xl p-space-md flex flex-col hover:border-error/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label-sm text-label-sm tracking-widest text-outline uppercase">KIA / Suspended</h3>
            <div className="p-2 bg-surface-container-highest rounded-lg border border-surface-container-high group-hover:border-error/30 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-error">block</span>
            </div>
          </div>
          <div className="font-headline-lg text-headline-lg text-on-surface">{stats.suspended}</div>
          <p className="font-body-sm text-body-sm text-error mt-2 flex items-center">
            <span className="material-symbols-outlined text-[14px] mr-1">gavel</span> Violations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        
        {/* Upcoming Tournament Widget */}
        <div className="lg:col-span-2 bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
          
          <div className="p-space-md border-b border-surface-container-high/50 flex items-center justify-between bg-surface-container-lowest/50">
            <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container">sports_esports</span>
              Priority Scrimmage
            </h2>
            <Link href="/admin/tournaments/new" className="font-label-sm text-label-sm px-space-md py-2 bg-primary-container text-on-primary-container rounded uppercase tracking-widest hover:bg-primary-fixed-dim transition-colors flex items-center gap-1 shadow-[0_0_15px_rgba(177,248,0,0.15)]">
              <span className="material-symbols-outlined text-[16px]">add</span> Deploy Op
            </Link>
          </div>
          
          <div className="p-space-lg flex-1 flex flex-col justify-center">
            {upcomingTournament ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-wider mb-1">{upcomingTournament.name}</h3>
                    <p className="font-mono text-[11px] tracking-widest text-primary-container">{new Date(upcomingTournament.tournamentDate).toLocaleString()}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="inline-block px-3 py-1 bg-surface-container-highest border border-surface-container-high rounded-md text-[10px] font-mono text-outline mb-2 uppercase tracking-widest">
                      {upcomingTournament.mode}
                    </span>
                    <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Team Size: {upcomingTournament.teamSize}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <div className="flex justify-between font-mono text-[11px] tracking-widest">
                    <span className="text-on-surface">CONFIRMED: {upcomingTournament.participants}</span>
                    <span className="text-outline">TARGET: {upcomingTournament.maxPlayers}</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-1 border border-surface-container-high/50 overflow-hidden">
                    <div className="bg-primary-container h-full" style={{ width: `${Math.min((upcomingTournament.participants/upcomingTournament.maxPlayers)*100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="flex gap-space-md mt-auto">
                  <Link href={`/admin/tournaments/${upcomingTournament.id}`} className="flex-1 text-center py-3 bg-surface-container-highest border border-surface-container-high rounded-lg text-outline hover:text-on-surface hover:border-primary-container/30 transition-colors font-label-sm uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">terminal</span> Override Parameters
                  </Link>
                  <button className="flex-1 text-center py-3 bg-surface-container-highest border border-surface-container-high rounded-lg text-outline hover:text-on-surface hover:border-primary-container/30 transition-colors font-label-sm uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">campaign</span> Broadcast Intel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-outline p-8 border border-surface-container-high border-dashed rounded-xl font-mono text-sm">
                No active operations scheduled. Awaiting deployment orders.
              </div>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-surface-container-low/80 backdrop-blur-xl border border-surface-container-high rounded-xl flex flex-col h-full overflow-hidden">
          <div className="p-space-md border-b border-surface-container-high/50 bg-surface-container-lowest/50">
            <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-error">assignment_late</span>
              Pending Dossiers
            </h2>
          </div>
          
          <div className="p-space-md flex-1 flex flex-col gap-space-sm">
            {pendingMembers.length > 0 ? (
              pendingMembers.map((member: any) => (
                <div key={member.id} className="flex items-center justify-between p-space-sm bg-surface-container-highest/50 border border-surface-container-high rounded-lg hover:border-error/30 transition-colors">
                  <div className="flex flex-col overflow-hidden">
                    <h4 className="font-title-sm text-title-sm text-on-surface truncate">{member.codmUsername}</h4>
                    <p className="font-mono text-[9px] text-error tracking-widest uppercase mt-1">Pending Clearance</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={`/api/members/${member.id}/approve`} method="POST">
                      <button className="w-8 h-8 flex items-center justify-center bg-surface-container-lowest border border-surface-container-high rounded hover:border-primary-container hover:text-primary-container text-outline transition-colors">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-outline text-sm italic py-8 font-mono">
                All operator dossiers cleared.
              </div>
            )}
            
            <Link href="/admin/members" className="block text-center w-full py-3 bg-surface-container-highest border border-surface-container-high rounded-lg text-outline hover:text-on-surface hover:border-outline/50 transition-colors font-label-sm uppercase tracking-widest mt-auto">
              Access Full Registry
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
