// app/dashboard/shared/page.tsx
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default async function SharedWithMePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Find all shares where current user is the recipient
  const sharedHabits = await prisma.share.findMany({
    where: {
      recipientId: session.user.id,
    },
    include: {
      habit: {
        include: {
          checkIns: {
            orderBy: { date: 'desc' },
            take: 10, // recent ones for streak calc
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
    <div className="space-y-8 p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Shared with Me</h1>
      <p className="text-gray-600">
        Habits your friends have shared with you for accountability.
      </p>

      {sharedHabits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border">
          <h2 className="text-2xl font-semibold mb-4">No shared habits yet</h2>
          <p className="text-gray-600 mb-6">
            When friends share their habits with you, they'll appear here.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to My Habits</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sharedHabits.map((share) => {
            const habit = share.habit;
            const owner = habit.user;

            // Basic streak calculation (from recent check-ins)
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
              ? `${lastCheckIn.completed ? 'Done' : 'Missed'} ${formatDistanceToNow(lastCheckIn.date, { addSuffix: true })}`
              : 'No check-ins yet';

            return (
              <Card key={share.id} className="overflow-hidden hover:shadow-md transition">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <div>
                      <CardTitle className="text-xl">{habit.name}</CardTitle>
                      <CardDescription>
                        Shared by {owner.name || owner.email?.split('@')[0]}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {habit.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {habit.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-green-600">{currentStreak} day streak</p>
                      <p className="text-gray-500">Current</p>
                    </div>
                    <div>
                      <p className="font-medium">{lastCheckInText}</p>
                      <p className="text-gray-500">Last check-in</p>
                    </div>
                  </div>

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/habits/${habit.id}?shared=true`}>
                      View progress
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