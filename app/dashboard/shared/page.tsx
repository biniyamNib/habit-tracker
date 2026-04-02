// app/dashboard/shared/page.tsx
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

export default async function SharedWithMePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const sharedHabits = await prisma.share.findMany({
    where: {
      recipientId: session.user.id,
    },
    include: {
      habit: {
        include: {
          checkIns: {
            orderBy: { date: 'desc' },
            take: 10,
          },
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Shared with Me</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-3">
          Habits your friends have shared with you for mutual accountability
        </p>
      </div>

      {sharedHabits.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-20 px-8 text-center">
          <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">🤝</span>
          </div>
          <h2 className="text-2xl font-semibold mb-4">No shared habits yet</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8">
            When your friends share their habits with you, they will appear here.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">Back to My Habits</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sharedHabits.map((share) => {
            const habit = share.habit;
            const owner = habit.user;

            // Current streak calculation
            const sortedCheckIns = habit.checkIns.sort(
              (a, b) => b.date.getTime() - a.date.getTime()
            );

            let currentStreak = 0;
            for (const check of sortedCheckIns) {
              if (check.completed) {
                currentStreak++;
              } else {
                break;
              }
            }

            const lastCheckIn = sortedCheckIns[0];
            const lastCheckInText = lastCheckIn
              ? `${lastCheckIn.completed ? '✅ Done' : '❌ Missed'} ${formatDistanceToNow(lastCheckIn.date, { addSuffix: true })}`
              : 'No check-ins yet';

            return (
              <Card 
                key={share.id} 
                className="border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-all overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    {owner?.image ? (
                      <img
                        src={owner.image}
                        alt={owner.name || 'Owner'}
                        className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl tracking-tight truncate">{habit.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Shared by {owner?.name || owner?.email?.split('@')[0] || 'a friend'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {habit.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {habit.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-2xl font-semibold text-emerald-600">{currentStreak}</p>
                      <p className="text-xs text-zinc-500">day streak</p>
                    </div>
                    <div>
                      <p className="font-medium">{lastCheckInText}</p>
                      <p className="text-xs text-zinc-500">Last activity</p>
                    </div>
                  </div>

                  <Button asChild className="w-full py-6 bg-teal-600 hover:bg-teal-700">
                    <Link href={`/dashboard/habits/${habit.id}`}>
                      View Progress
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}