// app/dashboard/notifications/page.tsx
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const [nudges, friendRequests, recentShares] = await Promise.all([
    prisma.nudge.findMany({
      where: { recipientId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        sender: { select: { name: true, email: true } },
        habit: { select: { name: true } },
      },
    }),
    prisma.friendRequest.findMany({
      where: { receiverId: session.user.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { name: true, email: true } } },
    }),
    prisma.share.findMany({
      where: { recipientId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        habit: { select: { name: true } },
        owner: { select: { name: true, email: true } },
      },
    }),
  ]);

  const totalNotifications = nudges.length + friendRequests.length + recentShares.length;

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Stay updated with your friends and habits
          </p>
        </div>
        {totalNotifications > 0 && (
          <Badge variant="secondary" className="text-lg px-5 py-1.5">
            {totalNotifications} new
          </Badge>
        )}
      </div>

      {totalNotifications === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-20 text-center">
          <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">🔔</span>
          </div>
          <h2 className="text-2xl font-semibold mb-4">You're all caught up</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            New nudges, friend requests, and shares will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Nudges */}
          {nudges.length > 0 && (
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Nudges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {nudges.map((nudge) => (
                  <div
                    key={nudge.id}
                    className="p-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <p className="font-medium text-lg">
                          From {nudge.sender.name || nudge.sender.email?.split('@')[0]}
                        </p>
                        {nudge.habit && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            about <span className="font-medium">{nudge.habit.name}</span>
                          </p>
                        )}
                        <p className="mt-5 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                          {nudge.message}
                        </p>
                        <p className="text-xs text-zinc-500 mt-6">
                          {formatDistanceToNow(nudge.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      <Link href={`/dashboard/habits/${nudge.habit?.id || '#'}`} className="self-start">
                        <Button variant="outline" size="sm">
                          View Habit
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Friend Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {friendRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl"
                  >
                    <div>
                      <p className="font-medium text-lg">
                        {req.sender.name || req.sender.email}
                      </p>
                      <p className="text-sm text-zinc-500">wants to be friends</p>
                    </div>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                      Accept
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Shares */}
          {recentShares.length > 0 && (
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Recent Shares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentShares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl"
                  >
                    <div>
                      <p className="font-medium text-lg">{share.habit.name}</p>
                      <p className="text-sm text-zinc-500">
                        Shared by {share.owner.name || share.owner.email?.split('@')[0]}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/habits/${share.habit.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}