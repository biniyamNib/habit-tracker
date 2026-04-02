// app/dashboard/settings/actions.ts
'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const image = formData.get('image') as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name || undefined,
      image: image || undefined,
    },
  });

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  // Force client session refresh
  revalidatePath('/', 'layout'); // optional - helps NextAuth refresh
}

export async function toggleEmailNotifications(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const enabled = formData.get('enabled') === 'on';

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailNotifications: enabled },
  });

  revalidatePath('/dashboard/settings');
}

export async function removeFriend(friendId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { user1Id: session.user.id, user2Id: friendId },
        { user2Id: session.user.id, user1Id: friendId },
      ],
    },
  });

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/social');
}