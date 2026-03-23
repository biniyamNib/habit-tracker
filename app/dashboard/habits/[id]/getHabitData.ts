// app/dashboard/habits/[id]/getHabitData.ts
'use server';

import prisma  from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';

export async function getHabitData(id: string | undefined) {
  const session = await auth();
  console.log('[getHabitData] Current user ID:', session?.user?.id);
  console.log('[getHabitData] Requested habit ID:', id);

  if (!session?.user?.id) {
    console.log('[getHabitData] No authenticated user → unauthorized');
    throw new Error('Unauthorized');
  }

  // Guard against undefined/missing id
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.log('[getHabitData] Invalid/missing ID');
    notFound(); // or throw new Error('Habit ID required')
  }

  console.log('Fetching habit with ID:', id); // debug log

  const habit = await prisma.habit.findUnique({
    where: { id },
    include: {
      checkIns: {
        orderBy: { date: 'desc' },
      },
    },
  });

  console.log('[getHabitData] Found habit?', !!habit);
  if (habit) {
    console.log('[getHabitData] Habit owner ID:', habit.userId);
  }

  if (!habit || habit.userId !== session.user.id) {
    console.log('[getHabitData] Habit not found or ownership mismatch → 404');
    notFound();
  }

  return habit;
}