interface ClanBackgroundProps {
  /** 'default' for public pages, 'subtle' for dense admin dashboard views */
  variant?: 'default' | 'subtle';
}

export default function ClanBackground({ variant = 'default' }: ClanBackgroundProps) {
  const isSubtle = variant === 'subtle';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center bg-surface-container-lowest">
      {/* Layer 1: Full-screen ambient red/smoke glow from the clan crest */}
      <div
        className={`absolute inset-0 bg-cover bg-center scale-110 blur-2xl filter saturate-150 ${
          isSubtle ? 'opacity-15' : 'opacity-25'
        }`}
        style={{
          backgroundImage: "url('/logo/BP-BlackPanthers.jpeg')",
        }}
      />

      {/* Layer 2: Uncropped centered BP Black Panthers crest watermark */}
      <div
        className={`relative w-[92vw] h-[92vw] max-w-[780px] max-h-[780px] bg-contain bg-center bg-no-repeat filter contrast-125 mix-blend-lighten ${
          isSubtle ? 'opacity-[0.11]' : 'opacity-[0.24] md:opacity-[0.28]'
        }`}
        style={{
          backgroundImage: "url('/logo/BP-BlackPanthers.jpeg')",
        }}
      />

      {/* Layer 3: Cinematic vignette & depth gradients to keep text 100% readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/85 via-surface-container-lowest/50 to-surface-container-lowest/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#0c0e12_90%)]" />
    </div>
  );
}

