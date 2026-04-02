// app/dashboard/habits/[id]/HabitDetailClient.tsx
'use client';

import { format, startOfDay, isToday, subDays } from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pencil, Trash2, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import { deleteHabit, toggleCheckIn } from '../actions';
import { sendNudge } from '../../nudges/actions';

type HabitDetailClientProps = {
  habit?: {
    id: string;
    name: string;
    description?: string | null;
    color: string;
    userId: string;
    user?: {
      name: string | null;
      email: string | null;
      image?: string | null;
    };
    checkIns: Array<{
      id: string;
      habitId: string;
      date: Date;
      completed: boolean;
      note?: string | null;
    }>;
  } | null;
  friends?: Array<{ id: string; name: string | null; email: string | null }>;
  shares?: Array<{
    id: string;
    recipient: { id: string; name: string | null; email: string | null };
  }>;
  isOwner: boolean;
  isSharedWithMe: boolean;
  currentUserId: string;
};

export function HabitDetailClient({
  habit,
  friends = [],
  shares = [],
  isOwner,
  isSharedWithMe,
  currentUserId,
}: HabitDetailClientProps) {
  const router = useRouter();

  if (!habit) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">Habit not found</h2>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          This habit may have been deleted or you don't have access.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const today = startOfDay(new Date());

  // Streak chart data (last 60 days)
  const streakData = Array.from({ length: 60 }, (_, i) => {
    const date = subDays(today, i);
    const checkIn = habit.checkIns?.find(
      (c) => startOfDay(c.date).getTime() === startOfDay(date).getTime()
    );

    return {
      date: format(date, 'MMM dd'),
      completed: checkIn ? (checkIn.completed ? 1 : 0) : 0,
    };
  }).reverse();

  // Current streak
  let currentStreak = 0;
  let tempStreak = 0;
  const sortedCheckIns = [...habit.checkIns].sort((a, b) => b.date.getTime() - a.date.getTime());

  for (const check of sortedCheckIns) {
    if (check.completed) {
      tempStreak++;
      if (isToday(check.date)) currentStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  const todayCheckIn = habit.checkIns?.find((c) => isToday(c.date));

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-6">
      {/* Header + Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between gap-8">
        <div className="flex items-center gap-5">
          {isSharedWithMe && habit.user?.image ? (
            <img
              src={habit.user.image}
              alt={habit.user.name || 'Owner'}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-2xl flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
          )}
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{habit.name}</h1>
            {habit.description && (
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">{habit.description}</p>
            )}
            {isSharedWithMe && habit.user && (
              <p className="text-sm text-zinc-500 mt-1">
                Shared by {habit.user.name || habit.user.email?.split('@')[0]}
              </p>
            )}
          </div>
        </div>

        {/* Current Streak - Prominent */}
        <div className="text-center lg:text-right">
          <div className="text-6xl font-semibold text-emerald-600 dark:text-emerald-400">
            {currentStreak}
          </div>
          <p className="text-sm uppercase tracking-widest text-zinc-500">day streak</p>
        </div>
      </div>

      {/* Quick Actions Bar (Owner only) */}
      {isOwner && (
        <div className="flex flex-wrap gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5">
          <form action={async () => await toggleCheckIn(habit.id, new Date(), true)}>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={todayCheckIn?.completed}>
              ✅ Mark Done Today
            </Button>
          </form>

          <form action={async () => await toggleCheckIn(habit.id, new Date(), false)}>
            <Button type="submit" variant="destructive" disabled={!todayCheckIn?.completed && !todayCheckIn}>
              ❌ Mark Missed
            </Button>
          </form>

          <Button variant="outline" onClick={() => router.push(`/dashboard/habits/${habit.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Habit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{habit.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the habit and all its data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await deleteHabit(habit.id);
                    router.push('/dashboard');
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Habit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Read-only notice for shared viewers */}
      {isSharedWithMe && !isOwner && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-center">
          <p className="text-blue-700 dark:text-blue-300 font-medium">
            This is a shared habit • Read-only view
          </p>
        </div>
      )}

      {/* Sharing Status */}
      {isOwner && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sharing Status
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share Habit
              </Button>
            </CardTitle>
            <CardDescription>
              Shared with {shares.length} friend{shares.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shares.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 dark:text-zinc-400">
                <p className="mb-2">Not shared with anyone yet</p>
                <p className="text-sm">Share this habit to get accountability from friends</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {shares.map((share) => {
                  const recipient = share.recipient;
                  return (
                    <li
                      key={share.id}
                      className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-medium">
                          {recipient.name?.[0]?.toUpperCase() || recipient.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium">{recipient.name || recipient.email?.split('@')[0]}</p>
                          {recipient.email && <p className="text-sm text-zinc-500">{recipient.email}</p>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Revoke
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Thank You Button for Shared Viewers */}
      {isSharedWithMe && !isOwner && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Show appreciation</CardTitle>
            <CardDescription>Let the owner know you value their shared progress</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async () => {
                try {
                  await sendNudge(
                    habit.userId,
                    "Thank you for sharing your habit! It's inspiring and motivating to see your progress 💙",
                    habit.id
                  );
                } catch (err) {
                  console.error('Thank you nudge failed:', err);
                }
              }}
            >
              <Button type="submit" className="w-full sm:w-auto flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
                <Heart className="h-4 w-4" />
                Thank You for Sharing!
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Streak Chart */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Recent Activity (Last 60 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={streakData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => (v === 1 ? 'Done' : 'Miss')} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke={habit.color}
                  fill={habit.color}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Activity Heatmap</CardTitle>
          <CardDescription>Last 6 months of consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1.5 max-w-md mx-auto">
            {Array.from({ length: 180 }).map((_, i) => {
              const date = subDays(new Date(), 179 - i);
              const checkIn = habit.checkIns?.find(
                (c) => startOfDay(c.date).getTime() === startOfDay(date).getTime()
              );

              let intensity = 'bg-zinc-200 dark:bg-zinc-700';
              if (checkIn?.completed) intensity = 'bg-emerald-500';

              return (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-md ${intensity} hover:scale-110 transition-transform cursor-help`}
                  title={`${format(date, 'MMM d, yyyy')} — ${checkIn ? (checkIn.completed ? 'Completed' : 'Missed') : 'No activity'}`}
                />
              );
            })}
          </div>
          <div className="mt-6 flex justify-between text-xs text-zinc-500">
            <span>6 months ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}