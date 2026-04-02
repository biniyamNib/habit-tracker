// app/dashboard/page.tsx
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, TrendingUp } from 'lucide-react';

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      checkIns: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Good morning, {session.user.name?.split(' ')[0] || 'there'}</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Here's how your habits are doing today
          </p>
        </div>

        <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
          <Link href="/dashboard/habits/new" className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            New Habit
          </Link>
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-20 px-8 text-center">
          <div className="mx-auto w-16 h-16 bg-teal-100 dark:bg-teal-950 rounded-2xl flex items-center justify-center mb-6">
            <Calendar className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">No habits yet</h2>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8">
            Start your journey toward consistency. Create your first habit and invite friends for accountability.
          </p>
          <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
            <Link href="/dashboard/habits/new">Create Your First Habit</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
              <div className="text-sm text-zinc-500">Active Habits</div>
              <div className="text-4xl font-semibold mt-2">{habits.length}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
              <div className="text-sm text-zinc-500">Longest Streak</div>
              <div className="text-4xl font-semibold mt-2 flex items-baseline gap-1">
                27 <span className="text-base font-normal text-zinc-500">days</span>
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
              <div className="text-sm text-zinc-500">This Week</div>
              <div className="text-4xl font-semibold mt-2 text-emerald-600">4/7</div>
            </div>
          </div>

          {/* Recent Habits */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">Your Habits</h2>
              <Link href="/dashboard/habits" className="text-sm text-teal-600 hover:underline flex items-center gap-1">
                View all <TrendingUp className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit) => {
                const latestCheckIn = habit.checkIns[0];
                const isCompletedToday = latestCheckIn && 
                  new Date(latestCheckIn.date).toDateString() === new Date().toDateString();

                return (
                  <Link 
                    key={habit.id} 
                    href={`/dashboard/habits/${habit.id}`}
                    className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-7 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div 
                        className="w-11 h-11 rounded-2xl flex-shrink-0"
                        style={{ backgroundColor: habit.color || '#14b8a6' }}
                      />
                      <div className={`text-xs font-medium px-3 py-1 rounded-full ${isCompletedToday ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {isCompletedToday ? 'Done today' : 'Not yet'}
                      </div>
                    </div>

                    <h3 className="font-semibold text-xl tracking-tight mb-1">{habit.name}</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {habit.description || `${habit.frequency} habit`}
                    </p>

                    <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                      <div className="text-xs text-zinc-500">View details</div>
                      <Button variant="ghost" size="sm" className="group-hover:bg-teal-50 dark:group-hover:bg-teal-950 text-teal-600">
                        Open →
                      </Button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}