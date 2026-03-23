// app/dashboard/habits/new/page.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createHabit } from '../actions';
import { Calendar, Dumbbell, Book, Coffee, Code, Heart, Target } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  color: z.string().default('#3b82f6'),
  icon: z.string().default('Target'),
});

type FormValues = z.infer<typeof formSchema>;

const iconOptions = [
  { value: 'Target', icon: Target, label: 'Goal' },
  { value: 'Code', icon: Code, label: 'Coding' },
  { value: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { value: 'Book', icon: Book, label: 'Reading' },
  { value: 'Coffee', icon: Coffee, label: 'Morning Routine' },
  { value: 'Heart', icon: Heart, label: 'Health' },
  { value: 'Calendar', icon: Calendar, label: 'Habit' },
];

export default function NewHabit() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('Target');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      frequency: 'daily',
      color: '#3b82f6',
      icon: 'Target',
    },
  });

  const watchName = form.watch('name');
  const watchFrequency = form.watch('frequency');
  const watchColor = form.watch('color');

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await createHabit(values);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      alert('Failed to create habit');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Habit</h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Form */}
        <div className="md:col-span-3">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Habit Name */}
            <div>
              <label className="text-sm font-medium">Habit Name</label>
              <Input
                {...form.register('name')}
                placeholder="e.g. Code for 1 hour"
                className="mt-2"
              />
            </div>

            {/* Icon & Color */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Icon</label>
                <Select onValueChange={(v) => {
                  form.setValue('icon', v);
                  setSelectedIcon(v);
                }} defaultValue={selectedIcon}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-3">
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Color</label>
                <Input
                  type="color"
                  {...form.register('color')}
                  className="mt-2 h-12 w-full p-1"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="text-sm font-medium">Frequency</label>
              <Select onValueChange={(v: any) => form.setValue('frequency', v)} defaultValue={watchFrequency}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                {...form.register('description')}
                placeholder="Why this habit matters to you..."
                className="mt-2"
              />
            </div>

            <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
              {loading ? 'Creating habit...' : 'Create Habit'}
            </Button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="md:col-span-2">
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Live Preview</p>
              <div
                className="h-40 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden"
                style={{ backgroundColor: watchColor || '#3b82f6' }}
              >
                <div className="text-5xl mb-3">
                  {iconOptions.find(i => i.value === selectedIcon)?.icon && 
                    React.createElement(iconOptions.find(i => i.value === selectedIcon)!.icon, { size: 48 })}
                </div>
                <p className="text-2xl font-bold text-center px-4">
                  {watchName || 'Your habit name'}
                </p>
                <Badge className="absolute bottom-4 bg-white/20 text-white">
                  {watchFrequency === 'daily' ? 'Daily' : watchFrequency === 'weekly' ? 'Weekly' : 'Custom'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}