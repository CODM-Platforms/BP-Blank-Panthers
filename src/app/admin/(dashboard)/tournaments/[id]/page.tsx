import { Users, Send, CheckCircle2, XCircle, Clock, Download, ShieldAlert, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function TournamentControlCenter() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-panther-text hover:text-panther-gold mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white uppercase">Friday Night Clan Battle</h1>
          <div className="flex items-center gap-3 mt-2 text-sm font-mono text-panther-text">
            <span className="px-2 py-1 bg-panther-dark border border-panther-border rounded text-white">BR | SQUAD</span>
            <span>•</span>
            <span>03 OCT 2026</span>
            <span>•</span>
            <span>20:00 EAT</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-panther-dark border border-panther-border rounded-lg text-white hover:border-panther-gold hover:text-panther-gold transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 bg-panther-gold text-panther-dark rounded-lg font-bold hover:bg-panther-gold-hover transition-colors">
            Generate Teams
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participants Summary */}
        <div className="bg-panther-card border border-panther-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-panther-gold" /> Participants
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Invited</span>
              <span className="font-bold text-white">80</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Confirmed</span>
              <span className="font-bold text-green-400">36</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text flex items-center gap-2"><XCircle className="w-4 h-4 text-red-400" /> Declined</span>
              <span className="font-bold text-red-400">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-panther-text flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" /> Pending</span>
              <span className="font-bold text-yellow-400">36</span>
            </div>
          </div>
        </div>

        {/* Squad Auto-Calculation */}
        <div className="bg-panther-card border border-panther-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-panther-gold" /> Squad Formation
          </h2>
          <div className="mb-6">
            <p className="text-sm text-panther-text mb-1">Squad Math (BR)</p>
            <p className="text-xl font-mono text-white">36 players ÷ 4 = <span className="text-panther-gold font-bold">9 Squads</span></p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Required Squads</span>
              <span className="font-bold text-white">9</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Created Squads</span>
              <span className="font-bold text-white">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-panther-text">Remaining Players</span>
              <span className="font-bold text-white">0</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Notifications */}
        <div className="bg-panther-card border border-panther-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-green-400" /> WhatsApp Status
          </h2>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Invitations Sent</span>
              <span className="font-bold text-white">80</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-panther-border">
              <span className="text-panther-text">Delivered</span>
              <span className="font-bold text-green-400">77</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-panther-text flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-400" /> Failed Delivery</span>
              <span className="font-bold text-red-400">3</span>
            </div>
          </div>
          <button className="w-full py-2 bg-panther-dark border border-panther-border rounded-lg text-white hover:border-panther-gold/50 transition-colors text-sm">
            Resend Failed Messages
          </button>
        </div>
      </div>

      {/* Main Teams / Participants Table Area */}
      <div className="bg-panther-card border border-panther-border rounded-xl overflow-hidden">
        <div className="border-b border-panther-border p-4 flex gap-6 bg-panther-dark/50">
          <button className="text-panther-gold font-bold border-b-2 border-panther-gold pb-2 -mb-4 px-2">Pending (36)</button>
          <button className="text-panther-text hover:text-white pb-2 -mb-4 px-2">Confirmed (36)</button>
          <button className="text-panther-text hover:text-white pb-2 -mb-4 px-2">Declined (8)</button>
          <button className="text-panther-text hover:text-white pb-2 -mb-4 px-2">Squads (0)</button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Action Needed</h3>
            <button className="px-4 py-2 bg-panther-dark border border-panther-border rounded-lg text-panther-text hover:text-white transition-colors text-sm flex items-center gap-2">
              <Send className="w-4 h-4" /> Send Reminder to All Pending
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-panther-border text-sm text-panther-text">
                <th className="pb-3 font-medium">Player</th>
                <th className="pb-3 font-medium">UID</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {['Luqman', 'Juma', 'Hassan'].map((name, i) => (
                <tr key={i} className="border-b border-panther-border/50 hover:bg-panther-dark/30">
                  <td className="py-4 font-bold text-white">{name}</td>
                  <td className="py-4 text-panther-text font-mono text-sm">6749{i}821...</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">Pending</span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-sm text-panther-gold hover:text-panther-gold-hover">Send Reminder</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
