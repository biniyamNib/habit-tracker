// app/api/notifications/unread/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma  from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ total: 0 });
  }

  const [nudges, requests, shares] = await Promise.all([
    prisma.nudge.count({ where: { recipientId: session.user.id, read: false } }),
    prisma.friendRequest.count({ where: { receiverId: session.user.id, status: 'pending' } }),
    prisma.share.count({
      where: {
        recipientId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return NextResponse.json({ total: nudges + requests + shares });
}