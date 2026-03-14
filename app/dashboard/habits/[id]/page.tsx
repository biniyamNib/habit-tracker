import prisma  from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { format, startOfDay, isToday, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { toggleCheckIn } from '../actions';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface HabitDetailProps {
  params: { id: string };
}

export default async function HabitDetail({ params }: HabitDetailProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const habit = await prisma.habit.findUnique({
    where: { id: params.id },
    include: {
      checkIns: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!habit || habit.userId !== session.user.id) {
    notFound();
  }

  // Prepare streak data (last 60 days for chart)
  const today = startOfDay(new Date());
  const streakData = Array.from({ length: 60 }, (_, i) => {
    const date = subDays(today, i);
    const checkIn = habit.checkIns.find(
      (c) => c.date.getTime() === date.getTime()
    );
    return {
      date: format(date, 'MMM dd'),
      completed: checkIn ? (checkIn.completed ? 1 : 0) : 0,
    };
  }).reverse(); // oldest to newest

  // Calculate current streak
  let currentStreak = 0;
  for (const check of habit.checkIns) {
    if (check.completed && isToday(check.date)) {
      currentStreak = 1;
      break;
    }
  }

  let tempStreak = currentStreak;
  for (let i = 1; i < habit.checkIns.length; i++) {
    const prev = habit.checkIns[i - 1];
    const curr = habit.checkIns[i];

    if (
      prev.completed &&
      (prev.date.getTime() - curr.date.getTime()) / (1000 * 60 * 60 * 24) <= 1.1
    ) {
      tempStreak++;
    } else {
      break;
    }
  }
  currentStreak = tempStreak;

  const longestStreak = Math.max(
    ...habit.checkIns.reduce((acc: number[], curr, idx) => {
      // Simple longest streak calc (can be improved later)
      if (curr.completed) {
        if (idx === 0 || !habit.checkIns[idx - 1].completed) {
          acc.push(1);
        } else {
          acc[acc.length - 1]++;
        }
      }
      return acc;
    }, [])
  ) || 0;

  const todayCheckIn = habit.checkIns.find((c) => isToday(c.date));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <div>
              <h1 className="text-3xl font-bold">{habit.name}</h1>
              {habit.description && (
                <p className="text-gray-600 mt-2">{habit.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {currentStreak} day streak
          </div>
          <div className="text-sm text-gray-500">
            Longest: {longestStreak} days
          </div>
        </div>
      </div>

      {/* Today's Check-in Card */}
      <Card>
        <CardHeader>
          <CardTitle>Today’s Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-lg">
              {todayCheckIn
                ? todayCheckIn.completed
                  ? '✅ Marked as done today!'
                  : '❌ Marked as missed'
                : 'Not marked yet'}
            </div>

            <div className="flex gap-4">
              <form
                action={async () => {
                  'use server';
                  await toggleCheckIn(habit.id, new Date(), true);
                }}
              >
                <Button
                  type="submit"
                  variant={todayCheckIn?.completed ? 'default' : 'outline'}
                  disabled={todayCheckIn?.completed}
                >
                  Mark Done
                </Button>
              </form>

              <form
                action={async () => {
                  'use server';
                  await toggleCheckIn(habit.id, new Date(), false);
                }}
              >
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={!todayCheckIn?.completed && !todayCheckIn}
                >
                  Mark Missed
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streak Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 60 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
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

      {/* Simple Calendar View (future: interactive selection) */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar Overview</CardTitle>
        </CardHeader>
        <CardContent>
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
                backgroundColor: habit.color + '33',
                color: habit.color,
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}