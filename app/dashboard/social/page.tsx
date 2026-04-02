// app/dashboard/social/page.tsx
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { sendFriendRequest, acceptFriendRequest } from './actions';

export default async function SocialPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const [pendingRequests, friendships, sentRequests] = await Promise.all([
    // Received pending requests
    prisma.friendRequest.findMany({
      where: { receiverId: session.user.id, status: 'pending' },
      include: { sender: { select: { name: true, email: true } } },
    }),

    // Friendships
    prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      },
      include: {
        user1: { select: { id: true, name: true, email: true } },
        user2: { select: { id: true, name: true, email: true } },
      },
    }),

    // Sent pending requests
    prisma.friendRequest.findMany({
      where: { senderId: session.user.id, status: 'pending' },
      include: { receiver: { select: { name: true, email: true } } },
    }),
  ]);

  // Deduplicate friends
  const friendMap = new Map<string, { id: string; name: string | null; email: string | null }>();

  friendships.forEach((f) => {
    const friend = f.user1Id === session.user.id ? f.user2 : f.user1;
    if (friend.id !== session.user.id) {
      friendMap.set(friend.id, friend);
    }
  });

  const friendList = Array.from(friendMap.values());

  return (
    <div className="max-w-5xl mx-auto space-y-12 p-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Friends & Accountability</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-3">
          Build habits together with people you trust
        </p>
      </div>

      {/* Add Friend */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Add a Friend</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              'use server';
              const email = formData.get('email') as string;
              if (!email) return;
              try {
                await sendFriendRequest(email);
              } catch (err: any) {
                console.error(err);
                // You can improve error handling later with toasts
              }
            }}
            className="flex gap-4"
          >
            <Input 
              name="email" 
              type="email" 
              placeholder="friend@example.com" 
              required 
              className="flex-1 py-6 text-base"
            />
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 px-8">
              Send Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Friend Requests */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-zinc-500 py-8 text-center">No pending friend requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div 
                  key={req.id} 
                  className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-6 rounded-2xl"
                >
                  <div>
                    <p className="font-medium">
                      {req.sender.name || req.sender.email}
                    </p>
                    <p className="text-sm text-zinc-500">{req.sender.email}</p>
                  </div>
                  <form action={async () => {
                    'use server';
                    await acceptFriendRequest(req.id);
                  }}>
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                      Accept
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Friends */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Your Friends ({friendList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {friendList.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              <p>No friends yet.</p>
              <p className="text-sm mt-2">Send a friend request above to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friendList.map((friend) => (
                <div 
                  key={friend.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-medium text-lg">
                      {(friend.name || friend.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-lg">
                        {friend.name || friend.email?.split('@')[0]}
                      </p>
                      {friend.email && (
                        <p className="text-sm text-zinc-500">{friend.email}</p>
                      )}
                    </div>
                  </div>

                  {/* You can add "Share a habit" button here later */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-6 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950"
                  >
                    Share a Habit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Requests (optional but useful) */}
      {sentRequests.length > 0 && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Sent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentRequests.map((req) => (
                <div key={req.id} className="text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl">
                  Waiting for {req.receiver.name || req.receiver.email} to accept...
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}