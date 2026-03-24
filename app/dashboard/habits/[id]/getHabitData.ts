// app/dashboard/habits/[id]/getHabitData.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';

export async function getHabitData(id: string | undefined) {
  console.log('=== getHabitData called ===');
  console.log('Received ID from route:', id);

  const session = await auth();
  console.log('Session user ID:', session?.user?.id || 'NO SESSION');

  if (!session?.user?.id) {
    console.log('No authenticated user → throwing unauthorized');
    throw new Error('Unauthorized');
  }

  if (!id) {
    console.log('ID is falsy/undefined → forcing notFound');
    notFound();
  }

  console.log('Querying Prisma for habit ID:', id);

  const habit = await prisma.habit.findUnique({
    where: { id },
    include: {
      checkIns: {
        orderBy: { date: 'desc' },
      },
    },
  });

  console.log('Prisma result - habit exists?', !!habit);
  if (habit) {
    console.log('Habit found → name:', habit.name);
    console.log('Habit owner userId:', habit.userId);
    console.log('Current session userId:', session.user.id);
    console.log('Ownership match?', habit.userId === session.user.id);
  } else {
    console.log('No habit found in DB for this ID');
  }

  if (!habit) {
    console.log('Habit is null → forcing notFound');
    notFound();
  }

  // Fetch current friends of the owner
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { user1Id: habit.userId },
        { user2Id: habit.userId },
      ],
    },
    select: {
      user1: { select: { id: true, name: true, email: true } },
      user2: { select: { id: true, name: true, email: true } },
    },
  });

  const friends = friendships
    .map(f => (f.user1.id === habit.userId ? f.user2 : f.user1))
    .filter(f => f.id !== habit.userId); // exclude self

  console.log('Friends fetched:', friends.length);

  // Fetch shares (who this habit is shared with)
  const shares = await prisma.share.findMany({
    where: { habitId: id },
    include: {
      recipient: { select: { id: true, name: true, email: true } },
    },
  });

  console.log('Shares fetched:', shares.length);

  return { habit, friends, shares };
}