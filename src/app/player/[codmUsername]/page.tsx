import { Trophy, Calendar, Target, Shield, Crosshair, Map, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/prisma/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
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
  } catch(e) {
    console.error("DB error", e);
  }

  if (!player) {
    notFound();
  }

  const winRate = player.tournamentsInvited > 0 ? Math.round((player.tournamentsAttended / player.tournamentsInvited) * 100) : 0;

  return (
    <div className="min-h-screen bg-panther-dark text-white font-sans selection:bg-panther-gold/30">
      
      {/* Header Profile */}
      <div className="pt-24 pb-12 px-4 border-b border-panther-border relative overflow-hidden bg-panther-card">
        <div className="absolute top-0 right-0 w-96 h-96 bg-panther-gold/5 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/roster" className="text-panther-gold font-bold mb-8 inline-block hover:underline">&larr; Back to Roster</Link>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-40 h-40 rounded-2xl bg-panther-dark border-2 border-panther-gold relative overflow-hidden shrink-0 shadow-[0_0_30px_rgba(230,200,117,0.2)]">
               {player.profilePicture ? (
                 <Image src={player.profilePicture} alt={player.codmUsername} fill className="object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center"><Shield className="w-16 h-16 text-panther-gold/50" /></div>
               )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight uppercase">{player.codmUsername}</h1>
              <p className="text-xl text-panther-text mt-2">{player.fullName}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                <span className="px-3 py-1 bg-panther-dark border border-panther-border rounded text-sm font-mono flex items-center gap-2"><Target className="w-4 h-4 text-panther-gold"/> {player.preferredMode}</span>
                <span className="px-3 py-1 bg-panther-dark border border-panther-border rounded text-sm font-mono flex items-center gap-2"><Map className="w-4 h-4 text-panther-gold"/> {player.region}, {player.country}</span>
                <span className="px-3 py-1 bg-panther-dark border border-panther-border rounded text-sm font-mono flex items-center gap-2"><Smartphone className="w-4 h-4 text-panther-gold"/> {player.deviceModel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-panther-card border border-panther-border rounded-xl p-6 text-center">
            <span className="block text-3xl font-bold text-white mb-1">{player.tournamentsAttended}</span>
            <span className="text-xs text-panther-text uppercase tracking-wider font-bold">Matches Played</span>
          </div>
          <div className="bg-panther-card border border-panther-border rounded-xl p-6 text-center">
            <span className="block text-3xl font-bold text-panther-gold mb-1">{winRate}%</span>
            <span className="text-xs text-panther-text uppercase tracking-wider font-bold">Attendance Rate</span>
          </div>
          <div className="bg-panther-card border border-panther-border rounded-xl p-6 text-center">
            <span className="block text-3xl font-bold text-white mb-1">{player.tournamentsDeclined}</span>
            <span className="text-xs text-panther-text uppercase tracking-wider font-bold">Declined</span>
          </div>
          <div className="bg-panther-card border border-red-500/20 rounded-xl p-6 text-center">
            <span className="block text-3xl font-bold text-red-400 mb-1">{player.tournamentsMissed}</span>
            <span className="text-xs text-red-400 uppercase tracking-wider font-bold">No Shows</span>
          </div>
        </div>

        {/* Tournament History */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Calendar className="w-6 h-6 text-panther-gold" /> Tournament History
        </h2>
        
        <div className="bg-panther-card border border-panther-border rounded-xl overflow-hidden">
          {player.participants.length === 0 ? (
            <div className="p-8 text-center text-panther-text">
              No tournament history found for this player.
            </div>
          ) : (
            <div className="divide-y divide-panther-border">
              {player.participants.map((p: any) => (
                <div key={p.id} className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-panther-dark/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-white text-lg">{p.tournament.name}</h3>
                    <p className="text-sm text-panther-text mt-1">{toJsDate(p.tournament.tournamentDate).toLocaleDateString()} • {p.tournament.mode}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {p.team && (
                      <span className="px-3 py-1 bg-panther-dark border border-panther-gold/30 rounded text-sm text-panther-gold font-bold">
                        {p.team.name}
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded text-xs font-bold border uppercase
                      ${p.attendanceStatus === 'ATTENDED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        p.attendanceStatus === 'NO_SHOW' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                    >
                      {p.attendanceStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
