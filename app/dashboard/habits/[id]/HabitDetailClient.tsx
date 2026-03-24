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
import { Pencil, Trash2, Heart } from 'lucide-react';
import { deleteHabit, toggleCheckIn } from '../actions';
import { sendNudge } from '../../nudges/actions'

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
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Habit not found</h2>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          This habit may have been deleted or you don't have access.
        </p>
        <Button asChild className="mt-6">
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
    ) ?? null;

    return {
      date: format(date, 'MMM dd'),
      completed: checkIn ? (checkIn.completed ? 1 : 0) : 0,
    };
  }).reverse();

  // Current streak calculation
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

  // Longest streak
  const longestStreak = Math.max(
    ...habit.checkIns.reduce((acc: number[], curr, idx) => {
      if (curr.completed) {
        if (idx === 0 || !habit.checkIns[idx - 1].completed) acc.push(1);
        else acc[acc.length - 1]++;
      }
      return acc;
    }, [])
  ) || 0;

  const todayCheckIn = habit.checkIns?.find((c) => isToday(c.date));

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header with owner info when shared */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4">
          {isSharedWithMe && habit.user?.image ? (
            <img
              src={habit.user.image}
              alt={habit.user.name || 'Owner'}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-zinc-700"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{habit.name}</h1>
            {habit.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{habit.description}</p>
            )}
            {isSharedWithMe && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Shared by {habit.user?.name || habit.user?.email?.split('@')[0] || 'someone'}
              </p>
            )}
          </div>
        </div>

        {/* Owner-only controls */}
        {isOwner && (
          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Longest: {longestStreak} day{longestStreak !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/habits/${habit.id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{habit.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the habit, all check-ins, and any shares. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          await deleteHabit(habit.id);
                          router.push('/dashboard');
                          router.refresh();
                        } catch (err) {
                          console.error('Delete failed:', err);
                          alert('Failed to delete habit');
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete Habit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>

      {/* Read-only notice for shared viewers */}
      {isSharedWithMe && !isOwner && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
          <p className="text-blue-700 dark:text-blue-300 font-medium">
            This is a shared habit • Read-only view
          </p>
        </div>
      )}

      {/* Today's Check-in – only visible to owner */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-lg font-medium">
                {todayCheckIn
                  ? todayCheckIn.completed
                    ? '✅ Marked as done today!'
                    : '❌ Marked as missed'
                  : 'Not marked yet'}
              </div>

              <div className="flex gap-4 w-full sm:w-auto">
                <form action={async () => await toggleCheckIn(habit.id, new Date(), true)}>
                  <Button
                    type="submit"
                    variant={todayCheckIn?.completed ? 'default' : 'outline'}
                    disabled={todayCheckIn?.completed}
                    className="w-full sm:w-auto"
                  >
                    Mark Done
                  </Button>
                </form>

                <form action={async () => await toggleCheckIn(habit.id, new Date(), false)}>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={!todayCheckIn?.completed && !todayCheckIn}
                    className="w-full sm:w-auto"
                  >
                    Mark Missed
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sharing Status – only visible to owner */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Sharing Status</CardTitle>
            <CardDescription>
              This habit is shared with {shares.length} friend{shares.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {shares.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>Not shared with anyone yet</p>
                <p className="text-sm mt-2">Share it to get accountability from friends</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {shares.map((share) => {
                  const recipient = share.recipient;
                  return (
                    <li
                      key={share.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                          {recipient.name?.[0]?.toUpperCase() || recipient.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium">
                            {recipient.name || recipient.email?.split('@')[0]}
                          </p>
                          {recipient.email && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{recipient.email}</p>
                          )}
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

      {/* Thank you / Reaction button – only for shared viewers */}
      {isSharedWithMe && !isOwner && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Show appreciation</CardTitle>
            <CardDescription>Let the owner know you value their shared progress</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async () => {
                // 'use server';
                try {
                  await sendNudge(
                    habit.userId,
                    "Thank you for sharing your habit! It's inspiring and motivating to see your progress 💙",
                    habit.id
                  );
                  // Optional: toast success message (add later if desired)
                } catch (err) {
                  console.error('Thank you nudge failed:', err);
                }
              }}
            >
              <Button type="submit" className="w-full md:w-auto flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Thank You for Sharing!
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Streak Chart – visible to everyone */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 60 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={streakData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => (v === 1 ? 'Done' : 'Miss')} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke={habit.color}
                  fill={habit.color}
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity Heatmap – visible to everyone */}
      <Card>
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

              let intensity = 'bg-gray-200 dark:bg-zinc-700';
              if (checkIn?.completed) {
                intensity = 'bg-green-500';
              }

              return (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-sm ${intensity} hover:scale-150 transition-transform cursor-help`}
                  title={`${format(date, 'MMM d, yyyy')} - ${checkIn ? (checkIn.completed ? 'Completed' : 'Missed') : 'No activity'}`}
                />
              );
            })}
          </div>
          <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>6 months ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}