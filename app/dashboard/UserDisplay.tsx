// app/dashboard/UserDisplay.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserDisplay() {
  const { data: session, status, update } = useSession();

  if (status === 'loading') {
    return <Skeleton className="h-9 w-40" />;
  }

  if (!session?.user) {
    return null;
  }

  const name = session.user.name || session.user.email?.split('@')[0] || 'User';
  const image = session.user.image;

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-700">
        <AvatarImage src={image || undefined} alt={name} />
        <AvatarFallback className="bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium">
          {name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="hidden md:block">
        <p className="font-medium text-sm leading-none">{name}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {session.user.email}
        </p>
      </div>
    </div>
  );
}