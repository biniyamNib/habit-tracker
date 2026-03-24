// app/dashboard/NotificationsBell.tsx
'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { HeartHandshake } from 'lucide-react';
import { Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

export default function NotificationsBell({
  initialCount,
  userId,
}: {
  initialCount: number;
  userId: string;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (!userId) return;

    const channel = pusherClient.subscribe(`user-${userId}`);

    channel.bind('new-nudge', () => setCount(c => c + 1));
    channel.bind('friend-accepted', () => setCount(c => c + 1));
    channel.bind('new-share', () => setCount(c => c + 1));

    return () => {
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
            >
              {count > 9 ? '9+' : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications ({count})</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard/nudges" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              Nudges
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/social" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Friend requests
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/shared" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              New shares
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm text-gray-500">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}