'use client';

import { useState } from 'react';
import { Image as ImageIcon, Send } from 'lucide-react';
import { createPost } from '@/app/admin/content/actions';

export default function CreatePostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
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

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPreviewImg(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <form
      className="space-y-6"
      action={async (formData) => {
        setIsSubmitting(true);
        if (previewImg) formData.append('imageUrl', previewImg);
        await createPost(formData);
        setIsSubmitting(false);
      }}
    >
      <div>
        <label className="block text-sm font-medium text-outline mb-2">Post Title</label>
        <input type="text" name="title" required placeholder="e.g., Our Clan Wins Zanzibar Championship" className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-outline mb-2">Category</label>
          <select name="category" className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container appearance-none">
            <option value="NEWS">News</option>
            <option value="ACHIEVEMENT">Achievement</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="TOURNAMENT">Tournament Result</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-outline mb-2">Publish Date</label>
          <input type="datetime-local" name="publishedAt" className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-outline mb-2">Content</label>
        <textarea name="content" required rows={6} placeholder="Write your post here..." className="w-full bg-surface-container-lowest border border-surface-container-high rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container resize-none"></textarea>
      </div>

      <div className="relative border-2 border-dashed border-surface-container-high rounded-xl p-8 text-center hover:border-primary-container/50 transition-colors cursor-pointer bg-surface-container-lowest/50 overflow-hidden">
        {previewImg ? (
          <img src={previewImg} alt="Cover preview" className="mx-auto max-h-48 rounded-lg" />
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-outline mx-auto mb-2" />
            <p className="text-sm text-outline">Click to upload cover image (or drag and drop)</p>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-surface-container-high">
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-primary-container text-surface-container-lowest font-bold rounded-lg hover:bg-primary-fixed-dim transition-colors flex items-center gap-2 disabled:opacity-50">
          <Send className="w-4 h-4" /> {isSubmitting ? 'Publishing...' : 'Publish Now'}
        </button>
      </div>
    </form>
  );
}
