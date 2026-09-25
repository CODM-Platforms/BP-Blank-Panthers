
import Link from 'next/link';
import { db } from '@/prisma/db';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col md:flex-row font-sans selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      
      {/* Background Graphic */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-10 filter contrast-125 saturate-50 scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB-9rTGcur1BRSQSmqEmNfM2OrWE8PDOIgAweVjC7yOz6s6kHmLE08ElDVIdVTG-HLfn7RBP-Lw6rCqPYQTtI4SXgeQ0pwzZoEXAYOBzZqSgtWHyqqXy8xgIDy9RZ5wEA7Ud5Jv_sr720Ar2MgacpEkAOxurNZa4cRB3AgShwrQ_wgfY7Vi8kD3N5OIi8pAofbKAyW5aIstNUSjtjP-4msTYr6P0hmJA8e6Kes8MN-PvtiZIZlmjn7lng')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/95 via-surface-container-lowest/90 to-surface-container-lowest/95 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0c0e12_85%)]"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 bg-surface-container-lowest/80 backdrop-blur-xl border-r border-surface-container-high/50 hidden md:flex flex-col relative z-20">
        
        {/* Logo Area */}
        <div className="h-24 flex items-center px-space-lg border-b border-surface-container-high/50">
          <Link href="/" className="flex items-center gap-space-sm group" title="Return to Public Grid">
            <img src="/logo/BP-BlackPanthers.jpeg" alt="BP Panthers Logo" className="h-10 w-10 object-cover rounded shadow-md border border-surface-container-high group-hover:border-primary-container transition-colors" />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md tracking-widest text-on-surface uppercase group-hover:text-primary-container transition-colors">BP PANTHERS</span>
              <span className="font-label-sm text-label-sm tracking-widest text-outline text-[9px]">Command Center</span>
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-space-md py-space-lg flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono text-[9px] mb-2 px-space-sm">Main Systems</span>
          
          <Link href="/admin" className="flex items-center px-space-md py-space-sm rounded-lg bg-primary-container/10 text-primary-container border border-primary-container/20 hover:bg-primary-container/20 transition-colors">
            <span className="material-symbols-outlined text-[20px] mr-3">dashboard</span>
            <span className="font-label-sm tracking-widest uppercase text-sm">Dashboard</span>
          </Link>
          
          <Link href="/admin/members" className="flex items-center px-space-md py-space-sm rounded-lg text-outline hover:bg-surface-container hover:text-on-surface border border-transparent transition-colors">
            <span className="material-symbols-outlined text-[20px] mr-3">group</span>
            <span className="font-label-sm tracking-widest uppercase text-sm">Operators</span>
          </Link>
          
          <Link href="/admin/tournaments" className="flex items-center px-space-md py-space-sm rounded-lg text-outline hover:bg-surface-container hover:text-on-surface border border-transparent transition-colors">
            <span className="material-symbols-outlined text-[20px] mr-3">sports_esports</span>
            <span className="font-label-sm tracking-widest uppercase text-sm">Tournaments</span>
          </Link>
          
          <Link href="/admin/content" className="flex items-center px-space-md py-space-sm rounded-lg text-outline hover:bg-surface-container hover:text-on-surface border border-transparent transition-colors">
            <span className="material-symbols-outlined text-[20px] mr-3">article</span>
            <span className="font-label-sm tracking-widest uppercase text-sm">Intel / News</span>
          </Link>

          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono text-[9px] mt-6 mb-2 px-space-sm">Configuration</span>

          <Link href="/admin/settings" className="flex items-center px-space-md py-space-sm rounded-lg text-outline hover:bg-surface-container hover:text-on-surface border border-transparent transition-colors">
            <span className="material-symbols-outlined text-[20px] mr-3">settings</span>
            <span className="font-label-sm tracking-widest uppercase text-sm">System Prefs</span>
          </Link>

          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono text-[9px] mt-6 mb-2 px-space-sm">External Access</span>

          <Link href="/" target="_blank" className="flex items-center px-space-md py-space-sm rounded-lg text-outline hover:bg-surface-container hover:text-on-surface border border-transparent transition-colors">
            <span className="material-symbols-outlined text-[20px] mr-3">public</span>
            <span className="font-label-sm tracking-widest uppercase text-sm">Public Terminal</span>
          </Link>

        </nav>

        {/* Footer */}
        <div className="p-space-md border-t border-surface-container-high/50">
          <form action={async () => {
             'use server'
             const { cookies } = await import('next/headers');
             cookies().delete('admin_session');
             const { redirect } = await import('next/navigation');
             redirect('/admin/login');
          }}>
            <button type="submit" className="flex items-center justify-center w-full px-space-md py-space-sm rounded-lg text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-colors">
              <span className="material-symbols-outlined text-[20px] mr-3">logout</span>
              <span className="font-label-sm tracking-widest uppercase text-sm">Terminate Session</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
        
        {/* Top Header */}
        <header className="h-24 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container-high/50 flex items-center justify-between px-space-xl z-20">
          <div className="flex flex-col">
            <h1 className="font-headline-sm text-headline-sm uppercase text-on-surface tracking-tight">Active Operation</h1>
            <span className="font-mono text-outline text-[11px] tracking-widest mt-1">{`SYS.DATE: ${new Date().toLocaleDateString()} // STATUS: SECURE`}</span>
          </div>
          
          <div className="flex items-center gap-space-lg">
            <button className="relative text-outline hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary-container rounded-full animate-pulse border-2 border-surface-container-lowest"></span>
            </button>
            <div className="h-10 w-px bg-surface-container-high"></div>
            <div className="flex items-center gap-space-sm">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest">Admin</span>
                <span className="font-mono text-[9px] text-outline tracking-widest">CLAN MASTER</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-primary-container/50 bg-surface-container overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-outline">person</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-space-xl">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
