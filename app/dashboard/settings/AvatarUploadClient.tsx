// app/dashboard/settings/AvatarUploadClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadButton } from "@uploadthing/react";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { updateProfile } from './actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AvatarUploadClient({
  currentName,
  currentImage,
  userId,
}: {
  currentName: string;
  currentImage: string;
  userId: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [image, setImage] = useState(currentImage);
  const [uploading, setUploading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);

    await updateProfile(formData);
    router.refresh();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="w-32 h-32">
          <AvatarImage src={image} alt="Avatar" />
          <AvatarFallback className="text-4xl">
            {name?.[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <UploadButton
          endpoint="avatarUploader"
          onClientUploadComplete={(res) => {
            if (res && res[0]) {
              setImage(res[0].url);
              setUploading(false);
            }
          }}
          onUploadError={(error: Error) => {
            alert(`Upload failed: ${error.message}`);
            setUploading(false);
          }}
          onUploadBegin={() => setUploading(true)}
        />
        {uploading && <p className="text-sm text-blue-600">Uploading avatar...</p>}
      </div>

      <form onSubmit={handleSave} className="flex-1 space-y-6 w-full">
        <div>
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            className="mt-2"
          />
        </div>

        <Button type="submit" className="w-full md:w-auto">
          Save Changes
        </Button>
      </form>
    </div>
  );
}