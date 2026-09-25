'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle, Calendar, Clock, Gamepad2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function ConfirmAttendance({ params }: { params: { token: string } }) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'declined'>('pending');
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // In a real app, you would fetch the tournament and player details using the token
  const tournament = {
    name: 'Friday Night Clan Battle',
    date: '03 Oct 2026',
    time: '20:00 EAT',
    mode: 'Battle Royale (Squad)',
  };
  const player = { name: 'Luqman' };

  const handleConfirm = () => {
    // API Call to update attendanceStatus to CONFIRMED
    setStatus('confirmed');
  };

  const handleDeclineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API Call to update attendanceStatus to DECLINED with declineReason
    setStatus('declined');
  };

  if (status === 'confirmed') {
    return (
      <div className="min-h-screen bg-panther-dark flex items-center justify-center p-4">
        <div className="bg-panther-card border border-panther-border rounded-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Attendance Confirmed!</h2>
          <p className="text-panther-text mb-6">
            You are confirmed for the {tournament.name}. Your squad information will be sent to your WhatsApp when teams are generated.
          </p>
          <div className="bg-panther-dark rounded-xl p-4 border border-panther-border text-sm text-panther-text mb-6">
            Please make sure to be online 15 minutes before the start time.
          </div>
        </div>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="min-h-screen bg-panther-dark flex items-center justify-center p-4">
        <div className="bg-panther-card border border-panther-border rounded-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Participation Declined</h2>
          <p className="text-panther-text mb-6">
            We have recorded your response. Thank you for letting the Clan Master know in advance.
          </p>
          <div className="text-sm text-panther-gold">
            Since you declined before the tournament, this will <span className="font-bold">not</span> count as a no-show penalty.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-panther-dark flex items-center justify-center p-4 selection:bg-panther-gold/30 selection:text-panther-white">
      <div className="bg-panther-card border border-panther-border rounded-2xl w-full max-w-md overflow-hidden animate-slide-up shadow-2xl">
        
        {/* Banner */}
        <div className="h-32 relative bg-panther-dark">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-panther-gold/20 via-panther-dark to-panther-dark"></div>
          <div className="absolute top-4 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-panther-gold z-10">
            <Image src="/logo/BP-BlackPanthers.jpeg" alt="Clan Logo" fill className="object-cover" />
          </div>
        </div>

        <div className="p-6 -mt-12 relative z-20">
          <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-wider">{tournament.name}</h1>
          <div className="inline-block px-3 py-1 bg-panther-dark border border-panther-border rounded-full text-xs font-bold text-panther-gold mb-6">
            TOURNAMENT INVITATION
          </div>

          <p className="text-lg text-white mb-6">Hello <span className="font-bold text-panther-gold">{player.name}</span> 👋</p>
          <p className="text-panther-text mb-6">You have been invited to participate in the upcoming clan tournament. Will you attend?</p>

          {/* Tournament Details Box */}
          <div className="bg-panther-dark border border-panther-border rounded-xl p-4 space-y-4 mb-8">
            <div className="flex items-center gap-3 text-white">
              <Calendar className="w-5 h-5 text-panther-gold" />
              <span>{tournament.date}</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Clock className="w-5 h-5 text-panther-gold" />
              <span>{tournament.time}</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Gamepad2 className="w-5 h-5 text-panther-gold" />
              <span className="font-mono">{tournament.mode}</span>
            </div>
          </div>

          {!showDeclineForm ? (
            <div className="space-y-3">
              <button 
                onClick={handleConfirm}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
              >
                <CheckCircle2 className="w-6 h-6" /> YES, I'LL ATTEND
              </button>
              <button 
                onClick={() => setShowDeclineForm(true)}
                className="w-full py-4 bg-panther-dark border border-panther-border hover:border-red-500/50 text-panther-text hover:text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <XCircle className="w-6 h-6" /> NO, I CANNOT ATTEND
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeclineSubmit} className="space-y-4 animate-fade-in">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 text-sm text-yellow-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Providing a reason helps leaders know why you can't make it and avoids no-show penalties.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-panther-text mb-2">Reason (Optional)</label>
                <select 
                  className="w-full bg-panther-dark border border-panther-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-panther-gold transition-colors appearance-none"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="work">Work</option>
                  <option value="school">School</option>
                  <option value="family">Family/Personal</option>
                  <option value="internet">Internet/Device Issues</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowDeclineForm(false)}
                  className="w-1/3 py-3 border border-panther-border rounded-lg text-panther-text hover:text-white transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="w-2/3 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
