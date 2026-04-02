// app/dashboard/nudges/page.tsx
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { markAllNudgesAsRead, markNudgeAsRead } from './actions';

export default async function NudgesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const received = await prisma.nudge.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { name: true, email: true } },
      habit: { select: { id: true, name: true } },
    },
  });

  const unreadCount = received.filter(n => !n.read).length;

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Nudges</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Encouragement from friends to help you stay consistent
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="text-lg px-5 py-1.5">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {/* Received Nudges */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Received Nudges</CardTitle>

          {received.some(n => !n.read) && (
            <form action={markAllNudgesAsRead}>
              <Button type="submit" variant="outline" size="sm" className="text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950">
                Mark all as read
              </Button>
            </form>
          )}
        </CardHeader>

        <CardContent>
          {received.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 dark:text-zinc-400">
              <p className="text-2xl mb-3">No nudges yet</p>
              <p className="max-w-md mx-auto">
                When friends send you encouragement or reminders, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {received.map((nudge) => (
                <div
                  key={nudge.id}
                  className={`p-7 rounded-3xl border transition-all ${
                    nudge.read
                      ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                      : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-medium text-lg">
                          From {nudge.sender.name || nudge.sender.email?.split('@')[0]}
                        </p>
                        {!nudge.read && (
                          <Badge className="bg-teal-600 text-white text-xs px-3 py-1">
                            New
                          </Badge>
                        )}
                      </div>

                      {nudge.habit && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                          about habit:{' '}
                          <Link
                            href={`/dashboard/habits/${nudge.habit.id}`}
                            className="text-teal-600 hover:underline font-medium"
                          >
                            {nudge.habit.name}
                          </Link>
                        </p>
                      )}

                      <p className="mt-5 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                        {nudge.message}
                      </p>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-6">
                        {formatDistanceToNow(nudge.createdAt, { addSuffix: true })}
                      </p>
                    </div>

                    {!nudge.read && (
                      <div className="flex-shrink-0 self-start">
                        <form action={async () => {
                          'use server';
                          await markNudgeAsRead(nudge.id);
                        }}>
                          <Button type="submit" variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                            Mark as read
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Nudges Placeholder */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Sent Nudges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
            <p>You haven't sent any nudges yet.</p>
            <p className="text-sm mt-3">Nudges you send to friends will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}