// app/dashboard/habits/actions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { startOfDay } from 'date-fns';
import { pusherServer } from '@/lib/pusher';

export async function createHabit(data: {
  name: string;
  description?: string;
  frequency: string;
  color: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name: data.name,
      description: data.description,
      frequency: data.frequency,
      color: data.color,
    },
  });

  revalidatePath('/dashboard');
  return habit;
}

export async function toggleCheckIn(habitId: string, date: Date = new Date(), completed: boolean = true) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  });

  if (!habit) throw new Error('Habit not found or not owned');

  const checkInDate = startOfDay(date);

  await prisma.checkIn.upsert({
    where: { habitId_date: { habitId, date: checkInDate } },
    update: { completed },
    create: { habitId, date: checkInDate, completed },
  });

  revalidatePath(`/dashboard/habits/${habitId}`);

  return { success: true };
}

export async function deleteHabit(habitId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  });

  if (!habit) throw new Error('Habit not found or not owned');

  await prisma.habit.delete({ where: { id: habitId } });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/habits');
  revalidatePath('/dashboard/shared');

  return { success: true };
}

export async function shareHabit(habitId: string, friendIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  });

  if (!habit) throw new Error('Habit not found or not owned');

  for (const friendId of friendIds) {
    const existing = await prisma.share.findFirst({
      where: { habitId, recipientId: friendId },
    });
    if (existing) continue;

    await prisma.share.create({
      data: {
        habitId,
        ownerId: session.user.id,
        recipientId: friendId,
        permission: 'view',
      },
    });
  }

  revalidatePath(`/dashboard/habits/${habitId}`);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/shared');
}