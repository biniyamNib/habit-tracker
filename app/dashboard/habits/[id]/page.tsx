// app/dashboard/habits/[id]/page.tsx
import { HabitDetailClient } from './HabitDetailClient';
import { getHabitData } from './getHabitData';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';

export const runtime = 'nodejs';

export default async function HabitDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const session = await auth();

  if (!session?.user?.id) {
    notFound();
  }

  const data = await getHabitData(params.id);

  if (!data?.habit) {
    notFound();
  }

  const currentUserId = session.user.id;
  const isOwner = data.habit.userId === currentUserId;
  const isSharedWithMe = !isOwner && data.shares?.some(share => share.recipient.id === currentUserId);

  if (!isOwner && !isSharedWithMe) {
    notFound();
  }

  return (
    <HabitDetailClient
      habit={data.habit}
      friends={data.friends ?? []}
      shares={data.shares ?? []}
      isOwner={isOwner}
      isSharedWithMe={isSharedWithMe}
      currentUserId={currentUserId}
    />
  );
}