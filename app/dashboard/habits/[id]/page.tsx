// app/dashboard/habits/[id]/page.tsx
import { HabitDetailClient } from './HabitDetailClient';
import { getHabitData } from './getHabitData';
import { notFound } from 'next/navigation';

export const runtime = 'nodejs';

export default async function HabitDetail({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  console.log('[page.tsx] Resolved params.id:', params.id);

  let data;
  try {
    data = await getHabitData(params.id);
    console.log('[page.tsx] Data fetched successfully');
  } catch (error) {
    console.error('[page.tsx] getHabitData failed:', error);
    notFound();
  }

  if (!data?.habit) {
    console.log('[page.tsx] No habit in data → forcing 404');
    notFound();
  }

  console.log('[page.tsx] Rendering client component with habit ID:', data.habit.id);

  return (
    <HabitDetailClient
      habit={data.habit}
      friends={data.friends ?? []}
      shares={data.shares ?? []}
    />
  );
}