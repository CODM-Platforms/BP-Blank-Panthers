'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { addTournamentPhoto, deleteTournamentPhoto } from '@/app/admin/tournaments/actions';

interface Photo {
  id: string;
  imageUrl: string;
  caption: string | null;
}

interface Props {
  tournamentId: string;
  photos: Photo[];
}

export default function TournamentPhotos({ tournamentId, photos }: Props) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 1400;
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

        setPreview(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (photoId: string) => {
    await deleteTournamentPhoto(photoId, tournamentId);
    router.refresh();
  };

  return (
    <div className="bg-surface-container-low border border-surface-container-high rounded-xl p-6">
      <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-primary-container" /> Result Photos
      </h2>
      <p className="text-sm text-outline mb-4">Upload final scoreboard or highlight screenshots. These show on the public tournament page.</p>

      <form
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-end mb-6"
        action={async (formData) => {
          if (!preview) return;
          setIsSubmitting(true);
          formData.append('imageUrl', preview);
          await addTournamentPhoto(tournamentId, formData);
          setPreview(null);
          setIsSubmitting(false);
          router.refresh();
        }}
      >
        <div className="flex-1 w-full">
          <label className="block text-xs text-outline uppercase mb-1">Photo</label>
          <div className="relative border-2 border-dashed border-surface-container-high rounded-lg p-4 text-center hover:border-primary-container/50 transition-colors cursor-pointer bg-surface-container-lowest/50 overflow-hidden">
            {preview ? (
              <img src={preview} alt="Preview" className="mx-auto max-h-32 rounded" />
            ) : (
              <p className="text-xs text-outline">Click to choose an image</p>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs text-outline uppercase mb-1">Caption (optional)</label>
          <input name="caption" type="text" placeholder="e.g. Final Scoreboard" className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-3 py-2 text-on-surface text-sm focus:outline-none focus:border-primary-container" />
        </div>
        <button type="submit" disabled={!preview || isSubmitting} className="px-4 py-2 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 shrink-0">
          {isSubmitting ? 'Uploading...' : 'Add Photo'}
        </button>
      </form>

      {photos.length === 0 ? (
        <p className="text-outline text-sm italic">No result photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group bg-surface-container-lowest border border-surface-container-high rounded-lg overflow-hidden">
              <img src={photo.imageUrl} alt={photo.caption ?? 'Result photo'} className="w-full aspect-square object-cover" />
              {photo.caption && (
                <p className="text-[11px] text-outline px-2 py-1 truncate">{photo.caption}</p>
              )}
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
