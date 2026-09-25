'use client';
import GlobalHeader from '@/components/GlobalHeader';
import Link from 'next/link';

import { useState } from 'react';
import { authenticateAdmin } from './actions';

export default function TacticalAdminLogin() {
  const [role, setRole] = useState('command');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuth = async (formData: FormData) => {
    setIsAuthenticating(true);
    setErrorMsg('');
    
    // Call the server action
    const result = await authenticateAdmin(formData);
    
    if (result?.error) {
      setErrorMsg(result.error);
      setIsAuthenticating(false);
    }
    // If successful, the action will automatically redirect via Next.js
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Background Graphic */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(12,14,18,0.92)_85%,#0c0e12_100%)]"></div>
      
      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex items-center justify-center px-margin-mobile py-space-xl">
        <div className="flex flex-col w-full relative items-center justify-center py-space-md">
          
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-cover bg-center opacity-30 filter contrast-125 saturate-50 scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-9rTGcur1BRSQSmqEmNfM2OrWE8PDOIgAweVjC7yOz6s6kHmLE08ElDVIdVTG-HLfn7RBP-Lw6rCqPYQTtI4SXgeQ0pwzZoEXAYOBzZqSgtWHyqqXy8xgIDy9RZ5wEA7Ud5Jv_sr720Ar2MgacpEkAOxurNZa4cRB3AgShwrQ_wgfY7Vi8kD3N5OIi8pAofbKAyW5aIstNUSjtjP-4msTYr6P0hmJA8e6Kes8MN-PvtiZIZlmjn7lng')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/90 via-surface-container-lowest/80 to-surface-container-lowest/95 backdrop-blur-[6px]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0c0e12_85%)]"></div>
          </div>

          <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col gap-space-lg">
            
            <div className="flex items-center justify-between px-space-md py-space-xs rounded-lg bg-surface-container-low/90 backdrop-blur-md shadow-md">
              <div className="flex items-center gap-space-sm">
                <span className="inline-flex relative h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
                </span>
                <span className="font-label-sm text-label-sm tracking-widest text-primary-container uppercase">SECURE COMM-LINK</span>
                <span className="text-outline text-body-sm font-body-sm opacity-40">/</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-mono tracking-wider">PROTOCOL S24.7</span>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[14px] text-primary-container">encrypted</span>
                <span className="font-label-sm text-label-sm tracking-widest uppercase text-outline">HARDWARE LEVEL 3</span>
              </div>
            </div>

            <div className="bg-surface-container-low/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden relative">
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80"></div>
              
              <div className="p-space-lg md:p-space-xl flex flex-col gap-space-lg">
                <div className="flex flex-col gap-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono">SYS.ID: 8092-OP-AUTH</span>
                    <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded bg-surface-container-high text-primary-container font-mono">CODM // TOURNAMENT READY</span>
                  </div>
                  <h1 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight flex items-center gap-space-xs">
                    Operator Access Terminal
                  </h1>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Enter verified BP Panthers Call of Duty: Mobile tactical credentials to initialize Command Center.
                  </p>
                </div>

                <div className="flex flex-col gap-space-sm">
                  <div className="flex items-center gap-space-sm my-space-xs">
                    <div className="flex-1 h-px bg-surface-container-high"></div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline text-[10px]">Secure Operator Verification</span>
                    <div className="flex-1 h-px bg-surface-container-high"></div>
                  </div>
                </div>

                <form className="flex flex-col gap-space-md" action={handleAuth}>
                  
                  {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold text-center uppercase tracking-wider">
                      ⚠ {errorMsg}
                    </div>
                  )}

                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1" htmlFor="identifier">
                        <span className="material-symbols-outlined text-[13px] text-primary-container">person</span>
                        Operator Callsign
                      </label>
                      <span className="font-label-sm text-label-sm uppercase text-outline text-[9px]">Required</span>
                    </div>
                    <div className="relative flex items-center">
                      <input name="identifier" type="text" required placeholder="e.g. Luqman or [BP] Shadow" className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all" />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">fingerprint</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1" htmlFor="password">
                        <span className="material-symbols-outlined text-[13px] text-primary-container">key</span>
                        Tactical Access Cipher
                      </label>
                      <a className="font-label-sm text-label-sm tracking-widest uppercase text-primary-container hover:underline text-[10px]" href="#">Forgot Cipher?</a>
                    </div>
                    <div className="relative flex items-center">
                      <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="••••••••••••" className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 pr-10 focus:outline-none focus:bg-surface-container transition-all tracking-widest" />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">lock</span>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-outline hover:text-on-surface transition-colors flex items-center justify-center p-1">
                        <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-space-xs">
                    <label className="flex items-center gap-space-sm cursor-pointer select-none">
                      <input defaultChecked className="w-4 h-4 rounded bg-surface-container-lowest accent-primary-container focus:ring-0 focus:outline-none" type="checkbox"/>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Remember Operator Terminal</span>
                    </label>
                    <span className="font-label-sm text-label-sm text-outline/60 font-mono text-[10px]">AUTH_V3</span>
                  </div>

                  <div className="p-space-sm rounded-lg bg-surface-container-lowest flex items-center justify-between text-outline text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                      <span>LATENCY: <strong className="text-on-surface">12ms (CORE-DB)</strong></span>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <span>ANTI-CHEAT: <strong className="text-primary-container">ARMED</strong></span>
                      <span className="opacity-40">|</span>
                      <span>AES-256</span>
                    </div>
                  </div>

                  <button type="submit" disabled={isAuthenticating} className="group w-full py-space-md px-space-lg rounded-lg bg-primary-container hover:bg-primary-fixed-dim active:scale-[0.99] text-on-primary-container font-headline-sm text-headline-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-space-sm shadow-[0_0_24px_rgba(255,59,59,0.2)] hover:shadow-[0_0_32px_rgba(255,59,59,0.35)] disabled:opacity-50">
                    {isAuthenticating ? (
                      <>
                        <span className="inline-block animate-spin material-symbols-outlined text-[20px]">sync</span>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Authorize & Enter Grid</span>
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </>
                    )}
                  </button>
                </form>

              </div>
              
              <div className="px-space-lg py-space-xs bg-surface-container-lowest flex items-center justify-between text-[10px] font-mono text-outline border-t border-surface-container-high/30">
                <div className="flex items-center gap-2">
                  <span>CODM DIVISION: TIER-1 INVITATIONAL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>SYS BUILD // 2026.1-PROD</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm hidden md:grid">
              <div className="p-space-sm rounded-lg bg-surface-container-low/70 backdrop-blur-md flex items-center gap-space-sm shadow-sm border border-surface-container-high/50">
                <span className="material-symbols-outlined text-primary-container text-[18px]">swords</span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider text-[9px]">Current Standings</span>
                  <span className="font-title-sm text-title-sm text-on-surface">#1 Clan Wars NA Division</span>
                </div>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low/70 backdrop-blur-md flex items-center gap-space-sm shadow-sm border border-surface-container-high/50">
                <span className="material-symbols-outlined text-primary-container text-[18px]">groups</span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider text-[9px]">Database Uplink</span>
                  <span className="font-title-sm text-title-sm text-on-surface">PostgreSQL Encrypted</span>
                </div>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low/70 backdrop-blur-md flex items-center gap-space-sm shadow-sm border border-surface-container-high/50">
                <span className="material-symbols-outlined text-primary-container text-[18px]">verified</span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider text-[9px]">Bot Module</span>
                  <span className="font-title-sm text-title-sm text-on-surface">RemoteAuth Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 w-full px-margin py-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-[16px] text-outline">verified_user</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">AES-256 Protocol Enforced</span>
        </div>
        <div className="flex items-center gap-space-md">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">© 2026 BP Black Panthers</span>
        </div>
      </footer>
    </div>
  );
}
