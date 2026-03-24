// app/dashboard/notifications/page.tsx
import { auth } from '@/lib/auth';
import prisma  from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const [unreadNudges, unreadRequests, newShares] = await Promise.all([
    // Unread nudges
    prisma.nudge.findMany({
      where: { recipientId: session.user.id, read: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { sender: { select: { name: true } }, habit: { select: { name: true } } },
    }),
    // Pending friend requests
    prisma.friendRequest.findMany({
      where: { receiverId: session.user.id, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { name: true, email: true } } },
    }),
    // New shares (last 7 days for "new")
    prisma.share.findMany({
      where: {
        recipientId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        habit: { select: { name: true, id: true } },
        owner: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-10 p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Notifications</h1>

      {/* Nudges */}
      <Card>
        <CardHeader>
          <CardTitle>Nudges ({unreadNudges.length} unread)</CardTitle>
        </CardHeader>
        <CardContent>
          {unreadNudges.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No new nudges</p>
          ) : (
            <div className="space-y-4">
              {unreadNudges.map(nudge => (
                <div key={nudge.id} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <p className="font-medium">
                    From {nudge.sender.name || 'a friend'}
                    {nudge.habit && ` about "${nudge.habit.name}"`}
                  </p>
                  <p className="mt-1">{nudge.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(nudge.createdAt, { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Friend Requests */}
      <Card>
        <CardHeader>
          <CardTitle>New Friend Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {unreadRequests.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {unreadRequests.map(req => (
                <div key={req.id} className="p-4 border rounded-lg">
                  <p className="font-medium">
                    {req.sender.name || req.sender.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Wants to connect
                  </p>
                  <div className="mt-3 flex gap-3">
                    <form action={async () => {
                      'use server';
                      await acceptFriendRequest(req.id); // from your existing actions
                    }}>
                      <Button type="submit" size="sm">Accept</Button>
                    </form>
                    <Button variant="outline" size="sm">Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Shares */}
      <Card>
        <CardHeader>
          <CardTitle>New Shares</CardTitle>
        </CardHeader>
        <CardContent>
          {newShares.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No new shared habits</p>
          ) : (
            <div className="space-y-4">
              {newShares.map(share => (
                <div key={share.id} className="p-4 border rounded-lg">
                  <p className="font-medium">
                    {share.owner.name || share.owner.email} shared a habit with you
                  </p>
                  <p className="text-sm mt-1">
                    Habit: <Link href={`/dashboard/habits/${share.habit.id}`} className="underline">
                      {share.habit.name}
                    </Link>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(share.createdAt, { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}