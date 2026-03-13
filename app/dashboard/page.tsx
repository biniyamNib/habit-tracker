import prisma  from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 5, // show recent ones
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Habits</h1>
        <Button asChild>
          <Link href="/dashboard/habits/new">
            <Plus className="h-4 w-4 mr-2" />
            New Habit
          </Link>
        </Button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <h2 className="text-2xl font-semibold mb-4">No habits yet</h2>
          <p className="text-gray-600 mb-6">
            Start building consistency today — create your first habit!
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/habits/new">Create First Habit</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                <div>
                  <h3 className="font-semibold text-lg">{habit.name}</h3>
                  <p className="text-sm text-gray-500">
                    {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                  </p>
                </div>
              </div>
              <Link href={`/dashboard/habits/${habit.id}`}>
                <Button variant="outline" className="w-full">
                  View & Check-in
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}