// app/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { Home, Users, Share2, Settings, Bell, HeartHandshake } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="fixed md:sticky top-16 md:top-16 z-40 md:z-auto h-[calc(100vh-4rem)] w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto transform -translate-x-full md:translate-x-0 transition-transform duration-300">
      <nav className="p-8 space-y-2">
        <Link 
          href="/dashboard" 
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${isActive('/dashboard') ? 'bg-teal-50 text-teal-600 dark:bg-teal-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}
        >
          <Home className="h-5 w-5" />
          <span className="font-medium">My Habits</span>
        </Link>

        <Link 
          href="/dashboard/social" 
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${isActive('/dashboard/social') ? 'bg-teal-50 text-teal-600 dark:bg-teal-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}
        >
          <Users className="h-5 w-5" />
          <span className="font-medium">Friends & Requests</span>
        </Link>

        <Link 
          href="/dashboard/shared" 
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${isActive('/dashboard/shared') ? 'bg-teal-50 text-teal-600 dark:bg-teal-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}
        >
          <Share2 className="h-5 w-5" />
          <span className="font-medium">Shared with Me</span>
        </Link>

        <Link 
          href="/dashboard/nudges" 
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${isActive('/dashboard/nudges') ? 'bg-teal-50 text-teal-600 dark:bg-teal-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}
        >
          <HeartHandshake className="h-5 w-5" />
          <span className="font-medium">Nudges</span>
        </Link>

        <Link 
          href="/dashboard/notifications" 
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${isActive('/dashboard/notifications') ? 'bg-teal-50 text-teal-600 dark:bg-teal-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}
        >
          <Bell className="h-5 w-5" />
          <span className="font-medium">Notifications</span>
        </Link>

        <Link 
          href="/dashboard/settings" 
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${isActive('/dashboard/settings') ? 'bg-teal-50 text-teal-600 dark:bg-teal-950' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </nav>
    </aside>
  );
}