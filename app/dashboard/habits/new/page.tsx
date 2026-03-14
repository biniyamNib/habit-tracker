// app/dashboard/habits/new/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';           // ← add this if missing
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createHabit } from '../actions';

const formSchema = z.object({
  name: z.string().min(1, 'Habit name is required'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  color: z.string().default('#3b82f6'),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewHabit() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      frequency: 'daily',
      color: '#3b82f6',
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await createHabit(values);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to create habit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Habit</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="name">Habit Name</Label>
          <Input id="name" {...register('name')} placeholder="e.g. Code for 1 hour" />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea id="description" {...register('description')} placeholder="Details or motivation..." />
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Select defaultValue="daily" onValueChange={(val) => {/* handle manually or use setValue */}}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="custom">Custom days</SelectItem>
            </SelectContent>
          </Select>
          {/* For Select + RHF, use Controller or setValue onChange */}
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input id="color" type="color" {...register('color')} />
          {errors.color && <p className="text-sm text-red-500 mt-1">{errors.color.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Habit'}
        </Button>
      </form>
    </div>
  );
}