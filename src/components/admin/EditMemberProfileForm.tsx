'use client';

import { useState } from 'react';
import { updateMemberProfile } from '@/app/admin/members/actions';
import { ALL_CODM_CLASSES } from '@/config/clan';

interface EditMemberProfileFormProps {
  member: {
    id: string;
    fullName: string;
    codmUsername: string;
    codmUid: string;
    whatsappNumber: string;
    deviceModel: string;
    deviceSerial: string;
    country: string;
    region: string;
    preferredMode: string;
    codmClass?: string | null;
    profilePicture?: string | null;
  };
}

export default function EditMemberProfileForm({ member }: EditMemberProfileFormProps) {
  const [previewImg, setPreviewImg] = useState<string | null>(member.profilePicture ?? null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
        setPhotoChanged(true);
        setErrorMsg('');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreviewImg(null);
    setPhotoChanged(true);
  };

  return (
    <form
      action={async (formData) => {
        setIsSaving(true);
        setErrorMsg('');
        if (photoChanged) {
          formData.set('profilePictureChanged', 'true');
          formData.set('profilePicture', previewImg ?? '');
        }
        try {
          await updateMemberProfile(member.id, formData);
        } catch (err: any) {
          setErrorMsg(err?.message || 'Failed to update profile.');
          setIsSaving(false);
        }
      }}
      className="bg-surface-container-low border border-surface-container-high rounded-xl p-6 space-y-5"
    >
      <h2 className="text-lg font-bold text-on-surface">Edit Profile &amp; Picture</h2>

      {errorMsg && (
        <div className="p-3 bg-error/10 border border-error/20 rounded text-error text-xs font-bold uppercase tracking-wider">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Profile Picture Uploader */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-surface-container-lowest border border-surface-container-high rounded-xl">
        <div className="w-20 h-20 rounded-full bg-surface-container-low border border-primary-container/40 overflow-hidden flex items-center justify-center shrink-0">
          {previewImg ? (
            <img src={previewImg} alt={member.codmUsername} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[32px] text-outline">person</span>
          )}
        </div>

        <div className="flex flex-col gap-2 text-center sm:text-left">
          <span className="text-sm font-medium text-on-surface">Profile Picture</span>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <label className="cursor-pointer px-4 py-2 bg-surface-container-highest hover:bg-primary-container hover:text-on-primary-container text-on-surface border border-surface-container-high rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add_a_photo</span>
              <span>{previewImg ? 'Change Picture' : 'Upload Picture'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
            {previewImg && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <span className="text-[11px] text-outline">Auto-compressed JPEG (max 5MB)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-outline mb-1">Full Name</label>
          <input
            name="fullName"
            type="text"
            required
            defaultValue={member.fullName}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">CODM Username</label>
          <input
            name="codmUsername"
            type="text"
            required
            defaultValue={member.codmUsername}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface font-mono focus:outline-none focus:border-primary-container"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">CODM UID</label>
          <input
            name="codmUid"
            type="text"
            required
            defaultValue={member.codmUid}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface font-mono focus:outline-none focus:border-primary-container"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">WhatsApp Number</label>
          <input
            name="whatsappNumber"
            type="text"
            required
            defaultValue={member.whatsappNumber}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface font-mono focus:outline-none focus:border-primary-container"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">Device Model</label>
          <input
            name="deviceModel"
            type="text"
            required
            defaultValue={member.deviceModel}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">Device Serial (last 6)</label>
          <input
            name="deviceSerial"
            type="text"
            required
            maxLength={8}
            defaultValue={member.deviceSerial}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface font-mono focus:outline-none focus:border-primary-container"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">Country</label>
          <input
            name="country"
            type="text"
            required
            defaultValue={member.country}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">City / Region</label>
          <input
            name="region"
            type="text"
            required
            defaultValue={member.region}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">Preferred Mode</label>
          <select
            name="preferredMode"
            defaultValue={member.preferredMode}
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container appearance-none"
          >
            <option value="BR">Battle Royale (BR)</option>
            <option value="MP">Multiplayer (MP)</option>
            <option value="Both">Both</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-1">CODM Class / Role (Optional)</label>
          <input
            name="codmClass"
            list="codm-classes-list"
            type="text"
            defaultValue={member.codmClass ?? ''}
            placeholder="e.g. Ninja, Medic, Slayer..."
            className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container"
          />
          <datalist id="codm-classes-list">
            {ALL_CODM_CLASSES.map((cls) => (
              <option key={cls} value={cls} />
            ))}
          </datalist>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="px-6 py-3 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

