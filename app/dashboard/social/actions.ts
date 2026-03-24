// app/dashboard/social/actions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { pusherServer } from '@/lib/pusher';

export async function sendFriendRequest(receiverEmail: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) throw new Error('Unauthorized');

  const receiver = await prisma.user.findUnique({
    where: { email: receiverEmail },
  });

  if (!receiver) throw new Error('User not found');
  if (receiver.id === session.user.id) throw new Error('Cannot add yourself');

  const existing = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: receiver.id },
        { senderId: receiver.id, receiverId: session.user.id },
      ],
    },
  });

  if (existing) throw new Error('Request already exists or already friends');

  const request = await prisma.friendRequest.create({
    data: {
      senderId: session.user.id,
      receiverId: receiver.id,
    },
  });

  // Notify receiver
  await pusherServer.trigger(`user-${receiver.id}`, 'new-friend-request', {
    id: request.id,
    sender: { id: session.user.id, name: session.user.name || session.user.email },
    createdAt: request.createdAt.toISOString(),
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

  // Notify sender that request was accepted
  await pusherServer.trigger(`user-${request.senderId}`, 'friend-accepted', {
    friend: { id: request.receiverId, name: session.user.name || session.user.email },
    createdAt: new Date().toISOString(),
  });

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

// export async function sendNudge(recipientId: string, message: string, habitId?: string) {
//   const session = await auth();
//   if (!session?.user?.id) throw new Error('Unauthorized');

//   // Basic permission check: either friends or the habit is shared with them
//   let hasPermission = false;

//   if (habitId) {
//     // Check if sender owns the habit and it's shared with recipient
//     const share = await prisma.share.findFirst({
//       where: {
//         habitId,
//         ownerId: session.user.id,
//         recipientId,
//       },
//     });
//     hasPermission = !!share;
//   } else {
//     // General nudge → check friendship
//     const friendship = await prisma.friendship.findFirst({
//       where: {
//         OR: [
//           { user1Id: session.user.id, user2Id: recipientId },
//           { user2Id: session.user.id, user1Id: recipientId },
//         ],
//       },
//     });
//     hasPermission = !!friendship;
//   }

//   if (!hasPermission) {
//     throw new Error('Not allowed to send nudge to this user');
//   }

//   const nudge = await prisma.nudge.create({
//     data: {
//       senderId: session.user.id,
//       recipientId,
//       habitId,
//       message,
//     },
//   });

//   revalidatePath('/dashboard/shared');
//   revalidatePath('/dashboard/social');

//   return nudge;
// }