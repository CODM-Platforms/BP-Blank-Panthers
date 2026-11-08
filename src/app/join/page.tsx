'use client';

import { useState } from 'react';
import Link from 'next/link';
import GlobalHeader from '@/components/GlobalHeader';
import ClanBackground from '@/components/ClanBackground';
import { submitDossier } from './actions';
import { CLAN_TAG, CODM_BR_CLASSES, CODM_MP_ROLES } from '@/config/clan';

export default function TacticalJoinPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('Ninja');
  const [selectedCountry, setSelectedCountry] = useState<string>('Tanzania');
  const [selectedRegion, setSelectedRegion] = useState<string>('Dar es Salaam');

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
      <ClanBackground />

      <GlobalHeader />

      <main className="relative z-10 w-full flex-1 flex flex-col items-center justify-start px-margin-mobile pt-space-xl pb-margin">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-space-lg">
          <div className="flex items-center justify-between px-space-md py-space-xs rounded-lg bg-surface-container-low/90 backdrop-blur-md shadow-md border border-surface-container-high/50">
            <div className="flex items-center gap-space-sm">
              <span className="inline-flex relative h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container"></span>
              </span>
              <span className="font-label-sm text-label-sm tracking-widest text-primary-container uppercase">RECRUITMENT OPEN</span>
            </div>
            <Link
              href="/"
              className="font-label-sm text-label-sm tracking-widest uppercase text-outline hover:text-on-surface flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              Back to Home
            </Link>
          </div>

          <div className="bg-surface-container-low/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden relative border border-surface-container-high">
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-80"></div>

            <div className="p-space-lg md:p-space-xl flex flex-col gap-space-lg">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono">CLAN APPLICATION</span>
                  <span className="font-label-sm text-label-sm px-space-sm py-0.5 rounded bg-surface-container-high text-primary-container font-mono">
                    {CLAN_TAG} • CODM
                  </span>
                </div>
                <h1 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight flex items-center gap-space-xs mt-2">
                  Join BP Black Panthers
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Fill in your Call of Duty: Mobile player details below to apply for the BP Black Panthers roster.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error/10 border border-error/20 rounded text-error text-xs font-bold text-center uppercase tracking-wider">
                  ⚠ {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-space-sm my-space-xs">
                <div className="flex-1 h-px bg-surface-container-high"></div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline text-[10px]">Player Information</span>
                <div className="flex-1 h-px bg-surface-container-high"></div>
              </div>

              <form
                className="flex flex-col gap-space-lg"
                action={async (formData) => {
                  setIsSubmitting(true);
                  setErrorMsg('');
                  if (previewImg) formData.append('profilePicture', previewImg);
                  const res = await submitDossier(formData);
                  if (res?.error) setErrorMsg(res.error);
                  setIsSubmitting(false);
                }}
              >
                {/* Profile Photo Upload */}
                <div className="flex flex-col gap-space-xs items-center justify-center p-space-md border border-dashed border-outline/30 rounded-lg bg-surface-container-lowest/50 hover:bg-surface-container-lowest transition-colors group cursor-pointer relative overflow-hidden h-40">
                  {previewImg ? (
                    <>
                      <img src={previewImg} alt="Preview" className="absolute inset-0 w-full h-full object-contain mix-blend-luminosity opacity-50" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-surface-container-lowest/80 backdrop-blur-sm transition-all">
                        <span className="material-symbols-outlined text-primary-container text-[32px] mb-2">change_circle</span>
                        <span className="font-label-sm text-label-sm tracking-widest uppercase text-primary-container">Change Profile Photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline text-[32px] group-hover:text-primary-container transition-colors mb-2">
                        add_a_photo
                      </span>
                      <span className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant group-hover:text-primary-container transition-colors">
                        Upload Profile Photo (Optional)
                      </span>
                      <span className="font-label-sm text-label-sm text-outline/50 mt-1 text-[9px] font-mono">MAX SIZE: 5MB</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
                </div>

                {/* Grid Container for Player Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">badge</span>
                      Full Name
                    </label>
                    <div className="relative flex items-center">
                      <input
                        name="fullName"
                        type="text"
                        required
                        placeholder="e.g. Luqman Hamza"
                        className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all"
                      />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">person</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">call</span>
                      WhatsApp Number
                    </label>
                    <div className="flex">
                      <select
                        name="countryCode"
                        className="h-11 bg-surface-container border-r border-surface-container-high rounded-l-lg px-3 text-on-surface font-body-md focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="+255">🇹🇿 +255</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+256">🇺🇬 +256</option>
                        <option value="+250">🇷🇼 +250</option>
                        <option value="+257">🇧🇮 +257</option>
                      </select>
                      <input
                        name="whatsapp"
                        type="tel"
                        required
                        inputMode="numeric"
                        onChange={handleNumericInput}
                        pattern="[0-9]{9}"
                        maxLength={9}
                        placeholder="771234567"
                        className="flex-1 h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-r-lg px-space-sm focus:outline-none focus:bg-surface-container transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">sports_esports</span>
                      CODM Username
                    </label>
                    <div className="relative flex items-center">
                      <span className="font-mono text-body-md text-primary-container absolute left-3 pointer-events-none whitespace-nowrap">
                        {CLAN_TAG}
                      </span>
                      <input
                        name="handle"
                        type="text"
                        required
                        placeholder="GUITZY"
                        style={{ paddingLeft: `${CLAN_TAG.length * 0.6 + 1.5}rem` }}
                        className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md focus:outline-none focus:bg-surface-container transition-all"
                      />
                    </div>
                    <p className="font-label-sm text-label-sm text-outline text-[9px]">
                      The {CLAN_TAG} clan tag is added automatically — just type your own name.
                    </p>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">fingerprint</span>
                      CODM UID
                    </label>
                    <div className="relative flex items-center">
                      <input
                        name="codmUid"
                        type="text"
                        required
                        inputMode="numeric"
                        onChange={handleNumericInput}
                        placeholder="Numbers only..."
                        className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all tracking-widest font-mono"
                      />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">pin</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">track_changes</span>
                      Preferred Game Mode
                    </label>
                    <div className="relative flex items-center">
                      <select
                        name="preferredMode"
                        defaultValue="Both"
                        className="w-full h-11 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer"
                      >
                        <option value="BR">Battle Royale (BR)</option>
                        <option value="MP">Multiplayer (MP)</option>
                        <option value="Both">Both (BR &amp; MP)</option>
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">military_tech</span>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute right-3 pointer-events-none">arrow_drop_down</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">shield</span>
                      Main CODM Class / Role
                    </label>
                    <div className="relative flex items-center">
                      <select
                        name="codmClass"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full h-11 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer"
                      >
                        <optgroup label="Battle Royale (BR) Classes">
                          {CODM_BR_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Multiplayer (MP) Roles">
                          {CODM_MP_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Not Listed?">
                          <option value="OTHER">Other (Type your class below)</option>
                        </optgroup>
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">category</span>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute right-3 pointer-events-none">arrow_drop_down</span>
                    </div>
                    {selectedClass === 'OTHER' && (
                      <input
                        name="customCodmClass"
                        type="text"
                        required
                        placeholder="Type your CODM class or role..."
                        className="w-full h-11 mt-2 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md border border-primary-container/40 focus:outline-none focus:bg-surface-container transition-all"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-space-sm my-space-xs">
                  <div className="flex-1 h-px bg-surface-container-high"></div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline text-[10px]">Device &amp; Location</span>
                  <div className="flex-1 h-px bg-surface-container-high"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">smartphone</span>
                      Phone / Device Model
                    </label>
                    <div className="relative flex items-center">
                      <input
                        name="deviceModel"
                        type="text"
                        required
                        placeholder="e.g. Samsung S23 Ultra / iPhone 14 Pro"
                        className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all"
                      />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">devices</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">memory</span>
                      Device Serial (Last 6 characters)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        name="deviceSerial"
                        type="text"
                        required
                        maxLength={6}
                        placeholder="e.g. 0D29XD"
                        className="w-full h-11 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all tracking-widest font-mono"
                      />
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">sim_card</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-container-lowest flex items-center gap-space-sm text-outline border border-surface-container-high/30">
                  <span className="material-symbols-outlined text-primary-container text-[20px]">policy</span>
                  <p className="font-body-sm text-body-sm leading-snug">
                    Device info is strictly used for <strong className="text-on-surface">fair play &amp; preventing duplicate accounts</strong> during clan tournaments.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">public</span>
                      Country
                    </label>
                    <div className="relative flex items-center">
                      <select
                        name="country"
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full h-11 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer"
                      >
                        <option value="Tanzania">Tanzania</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Rwanda">Rwanda</option>
                        <option value="Burundi">Burundi</option>
                        <option value="OTHER">Other (Type below)</option>
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">globe_africa</span>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute right-3 pointer-events-none">arrow_drop_down</span>
                    </div>
                    {selectedCountry === 'OTHER' && (
                      <input
                        name="customCountry"
                        type="text"
                        required
                        placeholder="Type your country..."
                        className="w-full h-11 mt-2 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md border border-primary-container/40 focus:outline-none focus:bg-surface-container transition-all"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-space-xs">
                    <label className="font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-primary-container">map</span>
                      City / Region
                    </label>
                    <div className="relative flex items-center">
                      <select
                        name="region"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full h-11 bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg px-space-md pl-10 focus:outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer"
                      >
                        <option value="Dar es Salaam">Dar es Salaam</option>
                        <option value="Zanzibar">Zanzibar</option>
                        <option value="Arusha">Arusha</option>
                        <option value="Mwanza">Mwanza</option>
                        <option value="Dodoma">Dodoma</option>
                        <option value="Mbeya">Mbeya</option>
                        <option value="Morogoro">Morogoro</option>
                        <option value="Tanga">Tanga</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Kampala">Kampala</option>
                        <option value="OTHER">Other (Type below)</option>
                      </select>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute left-3 pointer-events-none">location_on</span>
                      <span className="material-symbols-outlined text-[18px] text-outline absolute right-3 pointer-events-none">arrow_drop_down</span>
                    </div>
                    {selectedRegion === 'OTHER' && (
                      <input
                        name="customRegion"
                        type="text"
                        required
                        placeholder="Type your city or region..."
                        className="w-full h-11 mt-2 bg-surface-container-lowest text-on-surface placeholder:text-outline/50 font-body-md text-body-md rounded-lg px-space-md border border-primary-container/40 focus:outline-none focus:bg-surface-container transition-all"
                      />
                    )}
                  </div>
                </div>

                <div className="pt-space-md">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full py-space-md px-space-lg rounded-lg bg-primary-container hover:bg-primary-fixed-dim active:scale-[0.99] text-on-primary-container font-headline-sm text-headline-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-space-sm shadow-[0_0_24px_rgba(255,59,59,0.2)] hover:shadow-[0_0_32px_rgba(255,59,59,0.35)] disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">{isSubmitting ? 'hourglass_empty' : 'how_to_reg'}</span>
                    <span>{isSubmitting ? 'Submitting...' : 'Join the Clan'}</span>
                    {!isSubmitting && (
                      <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                    )}
                  </button>
                  <p className="text-center font-body-sm text-body-sm text-outline mt-space-sm">
                    Applying requires following the{' '}
                    <Link href="/rules" className="text-primary-container hover:underline">
                      BP Black Panthers Clan Rules
                    </Link>
                    .
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
