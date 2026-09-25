'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/members', label: 'Operators', icon: 'group' },
  { href: '/admin/tournaments', label: 'Tournaments', icon: 'sports_esports' },
  { href: '/admin/content', label: 'Intel / News', icon: 'article' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-space-md py-space-lg flex flex-col gap-space-xs">
      <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono text-[9px] mb-2 px-space-sm">Main Systems</span>

      {NAV_ITEMS.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? 'flex items-center px-space-md py-space-sm rounded-lg bg-primary-container/10 text-primary-container border border-primary-container/20 hover:bg-primary-container/20 transition-colors'
                : 'flex items-center px-space-md py-space-sm rounded-lg text-outline hover:bg-surface-container hover:text-on-surface border border-transparent transition-colors'
            }
          >
            <span className="material-symbols-outlined text-[20px] mr-3">{item.icon}</span>
            <span className="font-label-sm tracking-widest uppercase text-sm">{item.label}</span>
          </Link>
        );
      })}

      <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono text-[9px] mt-6 mb-2 px-space-sm">Configuration</span>

      <Link
        href="/admin/settings"
        className={
          pathname.startsWith('/admin/settings')
            ? 'flex items-center px-space-md py-space-sm rounded-lg bg-primary-container/10 text-primary-container border border-primary-container/20 hover:bg-primary-container/20 transition-colors'
            : 'flex items-center px-space-md py-space-sm rounded-lg text-outline hover:bg-surface-container hover:text-on-surface border border-transparent transition-colors'
        }
      >
        <span className="material-symbols-outlined text-[20px] mr-3">settings</span>
        <span className="font-label-sm tracking-widest uppercase text-sm">System Prefs</span>
      </Link>

      <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase font-mono text-[9px] mt-6 mb-2 px-space-sm">External Access</span>

      <Link href="/" target="_blank" className="flex items-center px-space-md py-space-sm rounded-lg text-outline hover:bg-surface-container hover:text-on-surface border border-transparent transition-colors">
        <span className="material-symbols-outlined text-[20px] mr-3">public</span>
        <span className="font-label-sm tracking-widest uppercase text-sm">Public Terminal</span>
      </Link>
    </nav>
  );
}
