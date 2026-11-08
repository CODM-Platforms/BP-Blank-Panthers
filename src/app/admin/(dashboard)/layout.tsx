
import Link from 'next/link';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ClanBackground from '@/components/ClanBackground';
import { getSessionUser } from '@/lib/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await getSessionUser();

  return (
    <div className="bg-surface-container-lowest text-on-surface min-h-screen flex flex-col md:flex-row font-sans selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      
      {/* Background Graphic */}
      <ClanBackground variant="subtle" />

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
        <AdminSidebar />

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
                <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-widest">{actor?.name ?? 'Unknown'}</span>
                <span className="font-mono text-[9px] text-outline tracking-widest">{actor?.role.replace('_', ' ') ?? ''}</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-primary-container/50 bg-surface-container overflow-hidden flex items-center justify-center">
                {actor?.member?.profilePicture ? (
                  <img src={actor.member.profilePicture} alt={actor.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-outline">person</span>
                )}
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
