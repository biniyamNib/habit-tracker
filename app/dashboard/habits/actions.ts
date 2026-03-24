// app/dashboard/habits/actions.ts
'use server';

import prisma  from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '@/lib/pusher';
import { startOfDay } from 'date-fns';

export async function createHabit(data: {
  name: string;
  description?: string;
  frequency: string;
  color: string;
  icon?: string;
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
      icon: data.icon,
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

  // Notify all recipients of this habit
  const shares = await prisma.share.findMany({
    where: { habitId },
    select: { recipientId: true },
  });

  for (const share of shares) {
    await pusherServer.trigger(`user-${share.recipientId}`, 'habit-update', {
      habitId,
      action: 'checkin',
      completed,
      date: checkInDate.toISOString(),
    });
  }

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

    // Real-time notify recipient
    await pusherServer.trigger(`user-${friendId}`, 'new-share', {
      habitId,
      habitName: habit.name,
      owner: { id: session.user.id, name: session.user.name || session.user.email },
      createdAt: new Date().toISOString(),
    });
  }

  revalidatePath(`/dashboard/habits/${habitId}`);
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/shared');
}