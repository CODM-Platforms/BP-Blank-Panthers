'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Calendar, Clock, Gamepad2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { confirmAttendance, declineAttendance } from '@/app/confirm/actions';

interface Props {
  token: string;
  playerName: string;
  tournamentName: string;
  tournamentDate: string;
  tournamentTime: string;
  tournamentMode: string;
  initialStatus: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'ATTENDED' | 'NO_SHOW';
}

export default function ConfirmAttendanceClient({ token, playerName, tournamentName, tournamentDate, tournamentTime, tournamentMode, initialStatus }: Props) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'declined'>(
    initialStatus === 'CONFIRMED' ? 'confirmed' : initialStatus === 'DECLINED' ? 'declined' : 'pending'
  );
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    setError('');
    const res = await confirmAttendance(token);
    setBusy(false);
    if (res.error) setError(res.error);
    else setStatus('confirmed');
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await declineAttendance(token, declineReason);
    setBusy(false);
    if (res.error) setError(res.error);
    else setStatus('declined');
  };

  if (status === 'confirmed') {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Attendance Confirmed!</h2>
          <p className="text-outline mb-6">
            You are confirmed for {tournamentName}. Your squad information will be sent to your WhatsApp when teams are generated.
          </p>
          <div className="bg-surface-container-lowest rounded-xl p-4 border border-surface-container-high text-sm text-outline mb-6">
            Please make sure to be online 15 minutes before the start time.
          </div>
        </div>
      </div>
    );
  }

  if (status === 'declined') {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="bg-surface-container-low border border-surface-container-high rounded-2xl p-8 max-w-md w-full text-center animate-slide-up">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Participation Declined</h2>
          <p className="text-outline mb-6">
            We have recorded your response. Thank you for letting the Clan Master know in advance.
          </p>
          <div className="text-sm text-primary-container">
            Since you declined before the tournament, this will <span className="font-bold">not</span> count as a no-show penalty.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4 selection:bg-primary-container/30 selection:text-on-surface">
      <div className="bg-surface-container-low border border-surface-container-high rounded-2xl w-full max-w-md overflow-hidden animate-slide-up shadow-2xl">

        <div className="h-32 relative bg-surface-container-lowest">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container/20 via-surface-container-lowest to-surface-container-lowest"></div>
          <div className="absolute top-4 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-primary-container z-10">
            <Image src="/logo/BP-BlackPanthers.jpeg" alt="Clan Logo" fill className="object-cover" />
          </div>
        </div>

        <div className="p-6 -mt-12 relative z-20">
          <h1 className="text-2xl font-bold text-on-surface mb-1 uppercase tracking-wider">{tournamentName}</h1>
          <div className="inline-block px-3 py-1 bg-surface-container-lowest border border-surface-container-high rounded-full text-xs font-bold text-primary-container mb-6">
            TOURNAMENT INVITATION
          </div>

          <p className="text-lg text-on-surface mb-6">Hello <span className="font-bold text-primary-container">{playerName}</span> 👋</p>
          <p className="text-outline mb-6">You have been invited to participate in the upcoming clan tournament. Will you attend?</p>

          <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-4 space-y-4 mb-8">
            <div className="flex items-center gap-3 text-on-surface">
              <Calendar className="w-5 h-5 text-primary-container" />
              <span>{tournamentDate}</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface">
              <Clock className="w-5 h-5 text-primary-container" />
              <span>{tournamentTime}</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface">
              <Gamepad2 className="w-5 h-5 text-primary-container" />
              <span className="font-mono">{tournamentMode}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-center mb-4">
              {error}
            </div>
          )}

          {!showDeclineForm ? (
            <div className="space-y-3">
              <button
                onClick={handleConfirm}
                disabled={busy}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50"
              >
                <CheckCircle2 className="w-6 h-6" /> YES, I&apos;LL ATTEND
              </button>
              <button
                onClick={() => setShowDeclineForm(true)}
                disabled={busy}
                className="w-full py-4 bg-surface-container-lowest border border-surface-container-high hover:border-red-500/50 text-outline hover:text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-6 h-6" /> NO, I CANNOT ATTEND
              </button>
            </div>
          ) : (
            <form onSubmit={handleDeclineSubmit} className="space-y-4 animate-fade-in">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3 text-sm text-yellow-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Providing a reason helps leaders know why you can&apos;t make it and avoids no-show penalties.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-outline mb-2">Reason (Optional)</label>
                <select
                  className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors appearance-none"
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
                  disabled={busy}
                  className="w-1/3 py-3 border border-surface-container-high rounded-lg text-outline hover:text-on-surface transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-2/3 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
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
