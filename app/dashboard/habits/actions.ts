'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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