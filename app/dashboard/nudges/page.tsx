// app/dashboard/nudges/page.tsx
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { markNudgeAsRead } from './actions';

export default async function NudgesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const received = await prisma.nudge.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { name: true, email: true } },
      habit: { select: { name: true, id: true } },
    },
  });

  const unreadCount = received.filter(n => !n.read).length;

  return (
    <div className="space-y-10 p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Nudges ({unreadCount} unread)</h1>

      {/* Received Nudges */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <CardTitle>Nudges ({received.length} unread)</CardTitle>
    
    {received.length > 0 && (
      <form action={async () => {
        'use server';
        await prisma.nudge.updateMany({
          where: {
            recipientId: session.user.id,
            read: false,
          },
          data: { read: true },
        });
        revalidatePath('/dashboard/nudges');
      }}>
        <Button type="submit" variant="outline" size="sm">
          Mark all as read
        </Button>
      </form>
    )}
  </CardHeader>

  <CardContent>
    {received.length === 0 ? (
      <p className="text-center py-12 text-gray-500 dark:text-gray-400">
        No nudges received yet
      </p>
    ) : (
      <div className="space-y-4">
        {received.map((nudge) => (
          <div
            key={nudge.id}
            className={`p-5 rounded-xl border ${
              nudge.read 
                ? 'bg-gray-50 dark:bg-zinc-900' 
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex justify-between">
              <div>
                <p className="font-medium">
                  From {nudge.sender.name || nudge.sender.email?.split('@')[0]}
                </p>
                {nudge.habit && (
                  <p className="text-sm text-gray-500">
                    about: <Link href={`/dashboard/habits/${nudge.habit.id}`} className="underline">
                      {nudge.habit.name}
                    </Link>
                  </p>
                )}
                <p className="mt-3 text-gray-700 dark:text-gray-300">{nudge.message}</p>
              </div>

              {!nudge.read && (
                <form action={async () => {
                  'use server';
                  await markNudgeAsRead(nudge.id);
                }}>
                  <Button type="submit" variant="ghost" size="sm">
                    Mark read
                  </Button>
                </form>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {formatDistanceToNow(nudge.createdAt, { addSuffix: true })}
            </p>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>

      {/* Optional: Sent Nudges */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Nudges</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... add sent nudges list if you want, similar to received ... */}
          <p className="text-center py-8 text-gray-500">
            (Sent nudges can be added here later)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}