// app/dashboard/layout.tsx
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Home, Users, Share2, Settings, Bell, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationsBell from './NotificationsBell'; 
import prisma from '@/lib/prisma';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Server-fetched initial unread count
  const unreadCount = await getUnreadCount(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-bold">
                C
              </div>
              ChainTogether
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {/* Notifications Bell – client component */}
              <NotificationsBell initialCount={unreadCount} userId={session.user.id} />

              {/* User info & sign out */}
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {session.user.name || session.user.email?.split('@')[0]}
                </span>
                <form action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-white dark:bg-zinc-900 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-6 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <Home className="h-5 w-5" />
              My Habits
            </Link>
            <Link href="/dashboard/social" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <Users className="h-5 w-5" />
              Friends & Requests
            </Link>
            <Link href="/dashboard/shared" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <Share2 className="h-5 w-5" />
              Shared with Me
            </Link>
            <Link href="/dashboard/nudges" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <HeartHandshake className="h-5 w-5" />
              Nudges
            </Link>
            <Link href="/dashboard/notifications" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <Bell className="h-5 w-5" />
              Notifications
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Server-only helper for initial count
async function getUnreadCount(userId: string) {
  const [nudges, requests, shares] = await Promise.all([
    prisma.nudge.count({ where: { recipientId: userId, read: false } }),
    prisma.friendRequest.count({ where: { receiverId: userId, status: 'pending' } }),
    prisma.share.count({
      where: {
        recipientId: userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return nudges + requests + shares;
}