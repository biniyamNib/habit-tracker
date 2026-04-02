// app/dashboard/layout.tsx
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { ThemeToggle } from '@/components/ThemeToggle';
import NotificationsBell from './NotificationsBell';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDisplay from './UserDisplay';
import MobileMenuButton from './MobileMenuButton';
import Sidebar from './Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const unreadCount = await getUnreadCount(session.user.id);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <MobileMenuButton />
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl">
                C
              </div>
              <span className="font-semibold text-xl tracking-tight">ChainTogether</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <NotificationsBell initialCount={unreadCount} userId={session.user.id} />
            
            <div className="hidden md:flex items-center gap-4">
              <UserDisplay />
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
      </header>

      <div className="flex">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-6 py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Server-only helper
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