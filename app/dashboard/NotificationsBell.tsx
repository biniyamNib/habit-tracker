// app/dashboard/NotificationsBell.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface NotificationsBellProps {
  initialCount: number;
  userId: string;
}

export default function NotificationsBell({ initialCount, userId }: NotificationsBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialCount);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time update (you can later connect to Pusher)
  useEffect(() => {
    // For now, we keep the server-fetched count
    // In future, we can add Pusher subscription here
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-medium p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <span className="text-xs text-teal-600 font-medium">
              {unreadCount} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {unreadCount === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">You're all caught up</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-auto">
            {/* Placeholder items - replace with real data later */}
            <DropdownMenuItem className="cursor-pointer p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <div>
                <p className="text-sm font-medium">New nudge received</p>
                <p className="text-xs text-zinc-500 mt-1">Your friend reminded you about "Code daily"</p>
                <p className="text-[10px] text-zinc-400 mt-2">2 minutes ago</p>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="cursor-pointer p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <div>
                <p className="text-sm font-medium">Friend request accepted</p>
                <p className="text-xs text-zinc-500 mt-1">Selam accepted your request</p>
                <p className="text-[10px] text-zinc-400 mt-2">1 hour ago</p>
              </div>
            </DropdownMenuItem>
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-teal-600 font-medium cursor-pointer justify-center py-3">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}