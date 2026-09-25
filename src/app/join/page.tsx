
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import { submitDossier } from './actions';
import { CLAN_TAG } from '@/config/clan';

export default function TacticalJoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress using Canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to highly compressed JPEG base64
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPreviewImg(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container pb-10">
      
      {/* Background Graphic */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 filter contrast-125 saturate-50 scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-9rTGcur1BRSQSmqEmNfM2OrWE8PDOIgAweVjC7yOz6s6kHmLE08ElDVIdVTG-HLfn7RBP-Lw6rCqPYQTtI4SXgeQ0pwzZoEXAYOBzZqSgtWHyqqXy8xgIDy9RZ5wEA7Ud5Jv_sr720Ar2MgacpEkAOxurNZa4cRB3AgShwrQ_wgfY7Vi8kD3N5OIi8pAofbKAyW5aIstNUSjtjP-4msTYr6P0hmJA8e6Kes8MN-PvtiZIZlmjn7lng')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/90 via-surface-container-lowest/80 to-surface-container-lowest/95 backdrop-blur-[4px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0c0e12_85%)]"></div>
      </div>
      
      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start px-margin-mobile pt-space-xl pb-margin">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-space-lg">
            
          <div className="flex items-center justify-between px-space-md py-space-xs rounded-lg bg-surface-container-low/90 backdrop-blur-md shadow-md border border-surface-container-high/50">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex relative h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
              </span>
              <span className="font-label-sm text-label-sm tracking-widest text-primary-container uppercase">OPEN ENROLLMENT</span>
              <span className="text-outline text-body-sm font-body-sm opacity-40">/</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-mono tracking-wider">PROTOCOL S24.7</span>
            </div>
            <Link href="/" className="font-label-sm text-label-sm tracking-widest uppercase text-outline hover:text-on-surface flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Abort sequence
            </Link>
          </div>

          <div className="bg-surface-container-low/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden relative border border-surface-container-high">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80"></div>
            
            <div className="p-space-lg md:p-space-xl flex flex-col gap-space-lg">
              
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono">SYS.ID: 9912-REQ-FORM</span>
                  <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded bg-surface-container-high text-primary-container font-mono">CODM // TOURNAMENT READY</span>
                </div>
                <h1 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight flex items-center gap-space-xs mt-2">
                  Combine Dossier
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Submit your tactical credentials to initialize the BP Black Panthers recruitment sequence.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error/10 border border-error/20 rounded text-error text-xs font-bold text-center uppercase tracking-wider">
                  ⚠ {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-space-sm my-space-xs">
                <div className="flex-1 h-px bg-surface-container-high"></div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline text-[10px]">Operator Profile</span>
                <div className="flex-1 h-px bg-surface-container-high"></div>
              </div>

              <form className="flex flex-col gap-space-lg" action={async (formData) => {
                setIsSubmitting(true);
                setErrorMsg('');
                if (previewImg) formData.append('profilePicture', previewImg);
                const res = await submitDossier(formData);
                if (res?.error) setErrorMsg(res.error);
                setIsSubmitting(false);
              }}>
                
                {/* Profile Photo Upload */}
                <div className="flex flex-col gap-space-xs items-center justify-center p-space-md border border-dashed border-outline/30 rounded-lg bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-colors group cursor-pointer relative overflow-hidden h-40">
                  {previewImg ? (
                    <>
                      <img src={previewImg} alt="Preview" className="absolute inset-0 w-full h-full object-contain mix-blend-luminosity opacity-50" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-surface-container-lowest/80 backdrop-blur-sm transition-all">
                        <span className="material-symbols-outlined text-primary-container text-[32px] mb-2">change_circle</span>
                        <span className="font-label-sm text-label-sm tracking-widest uppercase text-primary-container">Change Avatar</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline text-[32px] group-hover:text-primary-container transition-colors mb-2">add_a_photo</span>
                      <span className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant group-hover:text-primary-container transition-colors">Upload Avatar (Optional)</span>
                      <span className="font-label-sm text-label-sm text-outline/50 mt-1 text-[9px] font-mono">MAX SIZE: 5MB</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
                </div>

                {/* Grid Container for Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">badge</span>
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <input name="fullName" type="text" required placeholder="e.g. Luqman Hamza" className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all" />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">person</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">call</span>
                      Comms Uplink (WhatsApp)
                    </label>
                    <div className="flex">
                      <select name="countryCode" className="h-11 bg-surface-container border-r border-surface-container-high rounded-l-lg px-3 text-on-surface font-body-md focus:outline-none appearance-none cursor-pointer">
                        <option value="+255">🇹🇿 +255</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+256">🇺🇬 +256</option>
                        <option value="+250">🇷🇼 +250</option>
                        <option value="+257">🇧🇮 +257</option>
                      </select>
                      <input name="whatsapp" type="tel" required inputMode="numeric" onChange={handleNumericInput} pattern="[0-9]{9}" maxLength={9} placeholder="771234567" className="flex-1 h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-r-lg px-space-sm focus:outline-none focus:bg-surface-container transition-all" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">sports_esports</span>
                      CODM Callsign
                    </label>
                    <div className="relative flex items-center">
                      <span className="font-mono text-body-md text-primary-container absolute left-3 pointer-events-none whitespace-nowrap">{CLAN_TAG}</span>
                      <input
                        name="handle"
                        type="text"
                        required
                        placeholder="serveraugx"
                        style={{ paddingLeft: `${CLAN_TAG.length * 0.6 + 1.5}rem` }}
                        className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md focus:outline-none focus:bg-surface-container transition-all"
                      />
                    </div>
                    <p className="font-label-sm text-label-sm text-outline text-[9px]">Clan tag is added automatically - just type your own handle.</p>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">track_changes</span>
                      Combat Preference
                    </label>
                    <div className="relative flex items-center">
                      <select name="preferredMode" className="w-full h-11 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer">
                        <option value="BR">Battle Royale (BR)</option>
                        <option value="MP">Multiplayer (MP)</option>
                        <option value="BOTH">Versatile (Both)</option>
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">military_tech</span>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute right-3 pointer-events-none">arrow_drop_down</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">fingerprint</span>
                      CODM UID
                    </label>
                    <div className="relative flex items-center">
                      <input name="codmUid" type="text" required inputMode="numeric" onChange={handleNumericInput} placeholder="Numbers only..." className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all tracking-widest font-mono" />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">pin</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">qr_code</span>
                      Player ID
                    </label>
                    <div className="relative flex items-center">
                      <input name="playerId" type="text" required inputMode="numeric" onChange={handleNumericInput} placeholder="Numbers only..." className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all tracking-widest font-mono" />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">numbers</span>
                    </div>
                  </div>

                </div>

                <div className="flex items-center gap-space-sm my-space-xs">
                  <div className="flex-1 h-px bg-surface-container-high"></div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline text-[10px]">Hardware Telemetry</span>
                  <div className="flex-1 h-px bg-surface-container-high"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">smartphone</span>
                      Device Terminal
                    </label>
                    <div className="relative flex items-center">
                      <input name="deviceModel" type="text" required placeholder="e.g. OnePlus 10T" className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all" />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">devices</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">memory</span>
                      Serial (Last 4)
                    </label>
                    <div className="relative flex items-center">
                      <input name="deviceSerial" type="text" required maxLength={4} inputMode="numeric" onChange={handleNumericInput} placeholder="e.g. 7824" className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all tracking-widest font-mono" />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">sim_card</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-lowest flex items-center gap-space-sm text-outline border border-surface-container-high/30">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">policy</span>
                  <p className="font-body-sm text-body-sm leading-snug">
                    Telemetry is strictly for <strong className="text-on-surface">anti-cheat & multi-account prevention</strong>. Full hardware fingerprints remain completely secure.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">public</span>
                      Global Sector
                    </label>
                    <div className="relative flex items-center">
                      <select name="country" className="w-full h-11 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer">
                        <option value="TZ">Tanzania</option>
                        <option value="KE">Kenya</option>
                        <option value="UG">Uganda</option>
                        <option value="RW">Rwanda</option>
                        <option value="BI">Burundi</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">globe_africa</span>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute right-3 pointer-events-none">arrow_drop_down</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">map</span>
                      Local Node
                    </label>
                    <div className="relative flex items-center">
                      <select name="region" className="w-full h-11 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer">
                        <option value="ZNZ">Zanzibar</option>
                        <option value="DSM">Dar es Salaam</option>
                        <option value="OTHER">Other</option>
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">location_on</span>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute right-3 pointer-events-none">arrow_drop_down</span>
                    </div>
                  </div>
                </div>

                <div className="pt-space-md">
                  <button type="submit" disabled={isSubmitting} className="group w-full py-space-md px-space-lg rounded-lg bg-primary-container hover:bg-primary-fixed-dim active:scale-[0.99] text-on-primary-container font-headline-sm text-headline-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-space-sm shadow-[0_0_24px_rgba(255,59,59,0.2)] hover:shadow-[0_0_32px_rgba(255,59,59,0.35)] disabled:opacity-50">
                    <span className="material-symbols-outlined text-[20px]">{isSubmitting ? 'hourglass_empty' : 'how_to_reg'}</span>
                    <span>{isSubmitting ? 'TRANSMITTING...' : 'Submit Combine Dossier'}</span>
                    {!isSubmitting && <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>}
                  </button>
                  <p className="text-center font-body-sm text-body-sm text-outline mt-space-sm">
                    Initialization implies compliance with <a href="/#rules" className="text-primary-container hover:underline">BP Tactical Directives</a>.
                  </p>
                </div>

              </form>

            </div>
            
            <div className="px-space-lg py-space-xs bg-surface-container-lowest flex items-center justify-between text-[10px] font-mono text-outline border-t border-surface-container-high/30">
              <div className="flex items-center gap-2">
                <span>CODM DIVISION: TIER-1</span>
              </div>
              <div className="flex items-center gap-2">
                <span>SYS BUILD // 2026.1-PROD</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
