// app/dashboard/nudges/actions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { pusherServer } from '@/lib/pusher';

// Safe initialization
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

export async function sendNudge(recipientId: string, message: string, habitId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Permission check (friend or share)
  const canNudge = habitId
    ? await prisma.share.findFirst({
        where: {
          habitId,
          recipientId,
          ownerId: session.user.id,
        },
      })
    : await prisma.friendship.findFirst({
        where: {
          OR: [
            { user1Id: session.user.id, user2Id: recipientId },
            { user2Id: session.user.id, user1Id: recipientId },
          ],
        },
      });

  if (!canNudge) {
    throw new Error('Not allowed to send nudge to this user');
  }

  // Get sender info
  const sender = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  // Create nudge record
  const nudge = await prisma.nudge.create({
    data: {
      senderId: session.user.id,
      recipientId,
      habitId,
      message,
    },
    include: {
      sender: { select: { name: true } },
      habit: { select: { name: true } },
    },
  });

  // Real-time notification via Pusher
  await pusherServer.trigger(`user-${recipientId}`, 'new-nudge', {
    id: nudge.id,
    sender: nudge.sender,
    message: nudge.message,
    habitName: nudge.habit?.name,
    createdAt: nudge.createdAt.toISOString(),
  });

  // Email notification (non-blocking)
  if (resend) {
    try {
      const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { email: true, name: true },
      });

      if (recipient?.email) {
        await resend.emails.send({
          from: 'ChainTogether <onboarding@resend.dev>',
          to: [recipient.email],
          subject: 'You received a nudge!',
          html: `
            <h2>Hi ${recipient.name || 'there'}!</h2>
            <p>You received a nudge from ${sender?.name || sender?.email || 'a friend'}:</p>
            <blockquote style="border-left: 4px solid #3b82f6; padding-left: 12px; margin: 16px 0;">
              ${message}
            </blockquote>
            ${nudge.habit?.name ? `<p>Related to habit: <strong>${nudge.habit.name}</strong></p>` : ''}
            <p>View it here: <a href="http://localhost:3000/dashboard/nudges">ChainTogether Nudges</a></p>
          `,
        });
        console.log(`✅ Nudge email sent to ${recipient.email}`);
      }
    } catch (emailErr) {
      console.error('Email failed (non-blocking):', emailErr);
    }
  } else {
    console.warn('RESEND_API_KEY not set – skipping email');
  }

  revalidatePath('/dashboard/nudges');
  revalidatePath('/dashboard/shared');
  if (habitId) revalidatePath(`/dashboard/habits/${habitId}`);

  return nudge;
}

export async function markNudgeAsRead(nudgeId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const nudge = await prisma.nudge.findUnique({ where: { id: nudgeId } });

  if (!nudge || nudge.recipientId !== session.user.id) {
    throw new Error('Not authorized or nudge not found');
  }

  await prisma.nudge.update({
    where: { id: nudgeId },
    data: { read: true },
  });

  revalidatePath('/dashboard/nudges');

  return { success: true };
}

export async function markAllNudgesAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.nudge.updateMany({
    where: {
      recipientId: session.user.id,
      read: false,
    },
    data: { read: true },
  });

  revalidatePath('/dashboard/nudges');

  return { success: true };
}