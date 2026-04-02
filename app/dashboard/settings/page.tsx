// app/dashboard/settings/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AvatarUploadClient } from './AvatarUploadClient';
import { toggleEmailNotifications } from './actions';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailNotifications: true,
    },
  });

  if (!user) redirect('/auth/signin');

  return (
    <div className="max-w-4xl mx-auto space-y-12 p-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-3">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and avatar</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <AvatarUploadClient 
            currentName={user.name || ''} 
            currentImage={user.image || ''} 
            userId={user.id}
          />
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={toggleEmailNotifications} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <Label className="text-base font-medium">Receive email notifications</Label>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Get notified about nudges, friend requests, and new shares
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Switch
                name="enabled"
                defaultChecked={user.emailNotifications}
              />
              <Button type="submit" variant="outline" size="sm">
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Connected Friends (Placeholder - can be expanded) */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Connected Friends</CardTitle>
          <CardDescription>Manage your friends list</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-500 dark:text-zinc-400 text-center py-12">
            Friends management will be available here soon.<br />
            You can currently manage friends from the Social page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}