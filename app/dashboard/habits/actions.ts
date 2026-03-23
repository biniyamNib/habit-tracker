// app/dashboard/habits/actions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { startOfDay, endOfDay } from 'date-fns';

export async function createHabit(data: {
  name: string;
  description?: string;
  frequency: string;
  color: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

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

// Check-in or undo for a specific date (defaults to today)
export async function toggleCheckIn(habitId: string, date: Date = new Date(), completed: boolean = true) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Ensure the habit belongs to the user
  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId: session.user.id,
    },
  });

  if (!habit) {
    throw new Error('Habit not found or not owned by user');
  }

  const checkInDate = startOfDay(date);

  // Upsert: create if not exists, update if exists
  await prisma.checkIn.upsert({
    where: {
      habitId_date: {
        habitId,
        date: checkInDate,
      },
    },
    update: {
      completed,
    },
    create: {
      habitId,
      date: checkInDate,
      completed,
    },
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

  await prisma.habit.delete({
    where: { id: habitId },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/habits');
}