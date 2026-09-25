
import Link from 'next/link';

export default function GlobalHeader() {
  return (
    <header className="relative z-10 w-full px-margin py-space-md flex flex-wrap gap-4 items-center justify-between border-b border-surface-container-high/30 bg-surface-container-lowest/50 backdrop-blur-md">
      <div className="flex items-center gap-space-sm">
        <Link href="/">
          <img src="/logo/BP-BlackPanthers.jpeg" alt="BP Panthers Logo" className="h-10 w-10 object-cover rounded shadow-md border border-surface-container-high hover:border-primary-container transition-colors" />
        </Link>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md tracking-widest text-on-surface uppercase">BP PANTHERS</span>
          <span className="font-label-sm text-label-sm tracking-widest text-outline text-[9px]">Global Command Network</span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-space-md">
        <Link href="/" className="font-label-sm text-label-sm tracking-widest uppercase text-outline hover:text-primary-container transition-colors">Home</Link>
        <Link href="/roster" className="font-label-sm text-label-sm tracking-widest uppercase text-outline hover:text-primary-container transition-colors">Roster</Link>
        <Link href="/tournaments" className="font-label-sm text-label-sm tracking-widest uppercase text-outline hover:text-primary-container transition-colors">Tournaments</Link>
        <Link href="/join" className="font-label-sm text-label-sm tracking-widest uppercase text-outline hover:text-primary-container transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">how_to_reg</span> Recruitment
        </Link>
      </div>
      
      <div className="hidden sm:flex items-center gap-space-sm">
        <Link href="/admin/login" className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded border border-surface-container-high/60 hover:border-primary-container/50 hover:bg-surface-container-highest transition-colors cursor-pointer group">
          <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse group-hover:shadow-[0_0_8px_rgba(255,59,59,0.8)]"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider group-hover:text-primary-container transition-colors">SYS: ONLINE</span>
        </Link>
      </div>
    </header>
  );
}
