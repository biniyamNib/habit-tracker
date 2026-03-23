// app/dashboard/social/actions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function sendFriendRequest(receiverEmail: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    throw new Error('Unauthorized');
  }

  const receiver = await prisma.user.findUnique({
    where: { email: receiverEmail },
  });

  if (!receiver) {
    throw new Error('User not found');
  }

  if (receiver.id === session.user.id) {
    throw new Error('Cannot add yourself');
  }

  // Check if already friends or request exists
  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: receiver.id },
        { senderId: receiver.id, receiverId: session.user.id },
      ],
    },
  });

  if (existingRequest) {
    throw new Error('Request already exists or you are already connected');
  }

  const request = await prisma.friendRequest.create({
    data: {
      senderId: session.user.id,
      receiverId: receiver.id,
    },
  });

  revalidatePath('/dashboard/social');
  return request;
}

export async function acceptFriendRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.receiverId !== session.user.id || request.status !== 'pending') {
    throw new Error('Invalid request');
  }

  // Create mutual friendship (two records for bidirectional query ease)
  await prisma.$transaction([
    prisma.friendship.create({
      data: { user1Id: request.senderId, user2Id: request.receiverId },
    }),
    prisma.friendship.create({
      data: { user1Id: request.receiverId, user2Id: request.senderId },
    }),
    prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    }),
  ]);

  revalidatePath('/dashboard/social');
  return { success: true };
}

export async function shareHabit(habitId: string, friendIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  });

  if (!habit) throw new Error('Habit not found or not owned');

  // Verify friends exist and are connected
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { user1Id: session.user.id, user2Id: { in: friendIds } },
        { user2Id: session.user.id, user1Id: { in: friendIds } },
      ],
    },
  });

  const validFriendIds = new Set(friendships.flatMap(f => [f.user1Id, f.user2Id]));

  for (const friendId of friendIds) {
    if (!validFriendIds.has(friendId)) {
      throw new Error(`Not friends with user ${friendId}`);
    }

    // Avoid duplicates
    const existingShare = await prisma.share.findFirst({
      where: { habitId, recipientId: friendId },
    });

    if (!existingShare) {
      await prisma.share.create({
        data: {
          habitId,
          ownerId: session.user.id,
          recipientId: friendId,
          permission: 'view', // or 'nudge' later
        },
      });
    }
  }

  revalidatePath('/dashboard/habits');
  revalidatePath('/dashboard/social');
}

export async function shareHabitAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const habitId = formData.get('habitId') as string;
  const selectedFriendIds = formData.getAll('friendIds') as string[];

  if (!habitId || selectedFriendIds.length === 0) {
    return { success: false, message: 'No friends selected' };
  }

  // Reuse or copy logic from shareHabit
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: session.user.id },
  });

  if (!habit) {
    throw new Error('Habit not found or not owned');
  }

  // ... (rest of the validation and create Share logic from before)

  for (const friendId of selectedFriendIds) {
    // Check friendship exists
    const isFriend = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: friendId },
          { user2Id: session.user.id, user1Id: friendId },
        ],
      },
    });

    if (!isFriend) continue;

    await prisma.share.upsert({
      where: {
        habitId_recipientId: {
          habitId,
          recipientId: friendId,
        },
      },
      update: { permission: 'view' }, // or 'nudge'
      create: {
        habitId,
        ownerId: session.user.id,
        recipientId: friendId,
        permission: 'view',
      },
    });
  }

  revalidatePath('/dashboard/habits/[id]');
  revalidatePath('/dashboard');

  return { success: true };
}