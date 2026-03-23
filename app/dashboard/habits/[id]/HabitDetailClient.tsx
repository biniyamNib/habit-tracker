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

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteHabit } from '../actions';
import { toggleCheckIn } from '../actions';

type HabitDetailClientProps = {
  habit: {
    id: string;
    name: string;
    description?: string | null;
    color: string;
    checkIns: Array<{
      id: string;
      habitId: string;
      date: Date;
      completed: boolean;
      note?: string | null;
    }>;
  };
  friends: Array<{
    id: string;
    name: string | null;
    email: string | null;
  }>;
  shares: Array<{
    id: string;
    recipient: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
};

export function HabitDetailClient({ habit, friends, shares }: HabitDetailClientProps) {
  const router = useRouter();
  const today = startOfDay(new Date());

  // Chart data (last 60 days)
  const streakData = Array.from({ length: 60 }, (_, i) => {
    const date = subDays(today, i);
    const checkIn = habit.checkIns.find(c => startOfDay(c.date).getTime() === date.getTime());
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

  const todayCheckIn = habit.checkIns.find(c => isToday(c.date));

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex-shrink-0"
            style={{ backgroundColor: habit.color }}
          />
          <div>
            <h1 className="text-3xl font-bold">{habit.name}</h1>
            {habit.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">{habit.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
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
                <AlertDialogTitle>Delete this habit?</AlertDialogTitle>
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
                      alert('Failed to delete habit');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete Habit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Today's Check-in */}
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

      {/* Sharing Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sharing Status</CardTitle>
          <CardDescription>
            This habit is currently shared with {shares.length} friend{shares.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shares.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-6">
              Not shared with anyone yet
            </p>
          ) : (
            <ul className="space-y-3">
              {shares.map((share) => (
                <li
                  key={share.id}
                  className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium">
                      {share.recipient.name?.[0]?.toUpperCase() ||
                        share.recipient.email?.[0]?.toUpperCase() ||
                        '?'}
                    </div>
                    <div>
                      <p className="font-medium">
                        {share.recipient.name || share.recipient.email?.split('@')[0]}
                      </p>
                      {share.recipient.email && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {share.recipient.email}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Revoke button placeholder - can be implemented later */}
                  {/* <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    Revoke
                  </Button> */}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Streak Chart */}
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

      {/* Improved Streak Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Streak Heatmap</CardTitle>
          <CardDescription>Last 6 months of activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 180 }).map((_, i) => {
              const date = subDays(new Date(), 179 - i);
              const checkIn = habit.checkIns.find(
                (c) => startOfDay(c.date).getTime() === startOfDay(date).getTime()
              );
              let intensity = 'bg-gray-200 dark:bg-zinc-700';
              if (checkIn?.completed) {
                intensity = 'bg-green-500';
              }

              return (
                <div
                  key={i}
                  className={`w-4 h-4 md:w-5 md:h-5 rounded-sm ${intensity} hover:scale-150 transition-transform cursor-pointer`}
                  title={`${format(date, 'MMM d, yyyy')}${
                    checkIn ? ` - ${checkIn.completed ? 'Done' : 'Missed'}` : ' - No activity'
                  }`}
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

      {/* Calendar Overview (kept as secondary view) */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={new Date()}
              className="rounded-md border"
              modifiers={{
                completed: habit.checkIns
                  .filter((c) => c.completed)
                  .map((c) => c.date),
              }}
              modifiersStyles={{
                completed: {
                  fontWeight: 'bold',
                  backgroundColor: `${habit.color}33`,
                  color: habit.color,
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}