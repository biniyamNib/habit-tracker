// components/HabitCard.tsx
"use client";

import { toggleCheckIn } from "@/app/actions/habits";
import { useTransition } from "react";
import { cn } from "@/lib/utils"; // shadcn utils if you have it

type HabitWithTodayCheckIn = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  frequency: string;
  reminderTime?: string | null;
  checkIns: { completed: boolean }[];
};

export function HabitCard({ habit }: { habit: HabitWithTodayCheckIn }) {
  const [isPending, startTransition] = useTransition();
  const todayCheckIn = habit.checkIns[0];
  const isCompleted = todayCheckIn?.completed ?? false;

  const handleToggle = () => {
    startTransition(async () => {
      await toggleCheckIn(
        habit.id,
        new Date(),
        !isCompleted
      );
    });
  };

  return (
    <div className="border rounded-lg p-5 shadow-sm bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon || "•"}</span>
          <div>
            <h3 className="font-medium">{habit.name}</h3>
            <p className="text-sm text-muted-foreground">
              {habit.description || "No description"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={isPending}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all",
            isCompleted
              ? "bg-green-500/20 border-green-500 text-green-700 hover:bg-green-500/30"
              : "bg-background border-muted-foreground hover:border-primary hover:bg-primary/10",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          {isCompleted ? "✓" : ""}
        </button>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        Due: {habit.frequency} • Reminder at {habit.reminderTime || "none"}
      </div>
    </div>
  );
}