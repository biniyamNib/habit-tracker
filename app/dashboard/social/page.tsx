// app/dashboard/social/page.tsx
import { auth } from '@/lib/auth';
import prisma  from '@/lib/prisma';
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

  // Deduplicate friends using Map (prevents duplicate keys)
  const friendMap = new Map<string, { id: string; name: string | null; email: string | null }>();

  friendships.forEach((f) => {
    const friend = f.user1Id === session.user.id ? f.user2 : f.user1;
    if (friend.id !== session.user.id) {
      friendMap.set(friend.id, friend);
    }
  });

  const friendList = Array.from(friendMap.values());

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Social & Accountability</h1>

      {/* Add friend */}
      <Card>
        <CardHeader>
          <CardTitle>Add Friend</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              'use server';
              const email = formData.get('email') as string;
              try {
                await sendFriendRequest(email);
              } catch (err) {
                console.error(err);
              }
            }}
          >
            <div className="flex gap-4">
              <Input name="email" placeholder="Friend's email" required type="email" />
              <Button type="submit">Send Request</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Pending received requests */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Friend Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests</p>
          ) : (
            <ul className="space-y-4">
              {pendingRequests.map((req) => (
                <li key={req.id} className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <span>{req.sender.email || req.sender.name}</span>
                  <form
                    action={async () => {
                      'use server';
                      await acceptFriendRequest(req.id);
                    }}
                  >
                    <Button type="submit" variant="default">
                      Accept
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Current friends */}
      <Card>
        <CardHeader>
          <CardTitle>Your Friends ({friendList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {friendList.length === 0 ? (
            <p className="text-gray-500">No friends yet. Send a request to get started!</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {friendList.map((friend) => (
                <li
                  key={friend.id} // Now guaranteed unique
                  className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-gray-200 dark:border-white/10"
                >
                  <p className="font-medium">
                    {friend.name || friend.email?.split('@')[0] || 'Anonymous'}
                  </p>
                  {friend.email && (
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                      {friend.email}
                    </p>
                  )}
                  {/* You can add a "Share habit" button here later */}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Sent requests (optional) */}
      {sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {sentRequests.map((req) => (
                <li key={req.id} className="text-gray-600 dark:text-zinc-400">
                  Waiting for {req.receiver.email || req.receiver.name}...
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}