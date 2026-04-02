// app/dashboard/habits/new/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createHabit } from '../actions';
import { Calendar, Dumbbell, Book, Coffee, Code, Heart, Target } from 'lucide-react';
import React from 'react';

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  color: z.string().default('#14b8a6'),
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
      color: '#14b8a6',
      icon: 'Target',
    },
  });

  const watchName = form.watch('name');
  const watchFrequency = form.watch('frequency');
  const watchColor = form.watch('color');

  const selectedIconComponent = iconOptions.find(i => i.value === selectedIcon)?.icon;

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await createHabit(values);
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      alert('Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight">Create New Habit</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-3">
          What would you like to build consistency in?
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-12">
        {/* Form */}
        <div className="md:col-span-3">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Habit Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Habit Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="e.g. Code for 1 hour daily"
                className="text-lg py-6"
              />
            </div>

            {/* Icon & Color Picker */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-base">Icon</Label>
                <Select 
                  onValueChange={(value) => {
                    form.setValue('icon', value);
                    setSelectedIcon(value);
                  }} 
                  defaultValue={selectedIcon}
                >
                  <SelectTrigger className="py-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-3">
                          <opt.icon className="h-5 w-5" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-base">Color</Label>
                <div className="relative">
                  <Input
                    type="color"
                    {...form.register('color')}
                    className="h-14 w-full p-2 cursor-pointer"
                  />
                  <div 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border border-white/50 pointer-events-none"
                    style={{ backgroundColor: watchColor }}
                  />
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label className="text-base">Frequency</Label>
              <Select 
                onValueChange={(value: any) => form.setValue('frequency', value)} 
                defaultValue={watchFrequency}
              >
                <SelectTrigger className="py-6">
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
            <div className="space-y-2">
              <Label className="text-base">Description (optional)</Label>
              <Textarea
                {...form.register('description')}
                placeholder="Why does this habit matter to you? What will success look like?"
                className="min-h-28 py-4 text-base"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-7 text-lg bg-teal-600 hover:bg-teal-700"
              disabled={loading}
            >
              {loading ? 'Creating your habit...' : 'Create Habit'}
            </Button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="md:col-span-2">
          <div className="sticky top-8">
            <Card className="border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <CardContent className="p-8">
                <p className="text-xs uppercase tracking-widest text-zinc-500 mb-6">Live Preview</p>
                
                <div
                  className="h-64 rounded-3xl flex flex-col items-center justify-center text-white relative overflow-hidden shadow-inner"
                  style={{ backgroundColor: watchColor || '#14b8a6' }}
                >
                  <div className="text-7xl mb-6 opacity-90">
                    {selectedIconComponent && 
                      React.createElement(selectedIconComponent, { size: 72 })}
                  </div>
                  
                  <p className="text-3xl font-semibold text-center px-8 leading-tight">
                    {watchName || 'Your habit name'}
                  </p>

                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-8 bg-white/20 text-white hover:bg-white/30 text-sm px-4 py-1"
                  >
                    {watchFrequency === 'daily' ? 'Daily' : 
                     watchFrequency === 'weekly' ? 'Weekly' : 'Custom'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-zinc-500 mt-6">
              This is how your habit will appear on your dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}