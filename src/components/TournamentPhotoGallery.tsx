'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

export interface TournamentPhotoItem {
  id: string;
  imageUrl: string;
  caption: string | null;
}

interface Props {
  photos: TournamentPhotoItem[];
  tournamentName: string;
}

export default function TournamentPhotoGallery({ photos, tournamentName }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  const openPhoto = (index: number) => {
    setActiveIndex(index);
    setIsZoomed(false);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  };

  const showPrev = () => {
    if (activeIndex === null) return;
    setIsZoomed(false);
    setActiveIndex((activeIndex - 1 + photos.length) % photos.length);
  };

  const showNext = () => {
    if (activeIndex === null) return;
    setIsZoomed(false);
    setActiveIndex((activeIndex + 1) % photos.length);
  };

  // Light-dismiss fallback for browsers without native dialog closedBy support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      setActiveIndex(null);
      setIsZoomed(false);
    };

    dialog.addEventListener('close', handleClose);

    let cleanupLightDismiss: (() => void) | undefined;
    if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      };
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = e.target === dialog && isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && e.target === dialog && isOutside(e)) {
          dialog.close();
        }
        pressedOutside = false;
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      cleanupLightDismiss = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      cleanupLightDismiss?.();
    };
  }, []);

  // Left / Right keyboard navigation while modal is open
  useEffect(() => {
    if (activeIndex === null || photos.length <= 1) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsZoomed(false);
        setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + photos.length) % photos.length));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsZoomed(false);
        setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % photos.length));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, photos.length]);

  if (photos.length === 0) return null;

  return (
    <div className="flex flex-col gap-space-md mt-space-lg">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container">photo_camera</span>
          Result Photos &amp; Scoreboards ({photos.length})
        </h2>
        <span className="text-xs font-mono text-outline">Click any photo to view full screen</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-sm">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => openPhoto(index)}
            className="group text-left bg-surface-container-low/80 border border-surface-container-high hover:border-primary-container/60 rounded-xl overflow-hidden transition-all focus:outline-none focus:border-primary-container"
          >
            <div className="relative w-full aspect-video bg-black/60 overflow-hidden flex items-center justify-center">
              <img
                src={photo.imageUrl}
                alt={photo.caption ?? `${tournamentName} photo ${index + 1}`}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 bg-surface-container-lowest/90 border border-primary-container/40 text-on-surface text-xs font-mono uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-lg">
                  <Maximize2 className="w-3.5 h-3.5 text-primary-container" /> View Full Image
                </span>
              </div>
            </div>
            <div className="px-space-sm py-2.5 flex items-center justify-between gap-2 border-t border-surface-container-high/50">
              <p className="text-xs text-on-surface font-medium truncate">
                {photo.caption || `Match Screenshot #${index + 1}`}
              </p>
              <span className="text-[10px] font-mono text-primary-container uppercase shrink-0">Expand</span>
            </div>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby={titleId}
        className="m-auto w-[95vw] max-w-6xl max-h-[92vh] rounded-2xl bg-surface-container-low border border-surface-container-high text-on-surface p-0 shadow-2xl open:flex open:flex-col overflow-hidden"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-container-lowest border-b border-surface-container-high shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2.5 py-0.5 bg-primary-container/15 border border-primary-container/30 text-primary-container text-xs font-mono font-bold rounded">
              {activeIndex !== null ? `${activeIndex + 1} / ${photos.length}` : ''}
            </span>
            <h3 id={titleId} className="text-sm font-bold text-on-surface truncate">
              {activePhoto?.caption || `${tournamentName} — Match Scoreboard`}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsZoomed((z) => !z)}
              className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5"
              title={isZoomed ? 'Reset zoom' : 'Zoom in'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4 text-primary-container" /> : <ZoomIn className="w-4 h-4 text-primary-container" />}
              <span className="hidden sm:inline">{isZoomed ? 'Zoom Out' : 'Zoom In'}</span>
            </button>

            {activePhoto && (
              <a
                href={activePhoto.imageUrl}
                download={`${tournamentName.replace(/\s+/g, '-')}-photo-${(activeIndex ?? 0) + 1}.jpg`}
                className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5"
                title="Download image"
              >
                <Download className="w-4 h-4 text-primary-container" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            <form method="dialog">
              <button
                type="submit"
                autoFocus
                aria-label="Close photo viewer"
                className="p-1.5 bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Main Image Viewport */}
        <div className="relative flex-1 bg-black/90 overflow-auto flex items-center justify-center min-h-[50vh] max-h-[80vh] p-2 sm:p-4">
          {activePhoto && (
            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.caption ?? tournamentName}
              onClick={() => setIsZoomed((z) => !z)}
              className={`transition-transform duration-200 rounded select-none ${
                isZoomed
                  ? 'scale-150 cursor-zoom-out origin-center'
                  : 'max-h-[75vh] max-w-full w-auto h-auto object-contain cursor-zoom-in'
              }`}
            />
          )}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Previous photo"
                className="fixed sm:absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/90 hover:bg-primary-container hover:text-surface-container-lowest border border-surface-container-high text-on-surface flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Next photo"
                className="fixed sm:absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface-container-lowest/90 hover:bg-primary-container hover:text-surface-container-lowest border border-surface-container-high text-on-surface flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
