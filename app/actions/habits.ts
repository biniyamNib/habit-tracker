// app/actions/habits.ts
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleCheckIn(habitId: string, date: Date, completed: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const normalizedDate = new Date(date.setHours(0, 0, 0, 0));

  // Upsert: create if not exists, update if exists
  await prisma.checkIn.upsert({
    where: {
      habitId_date: {
        habitId,
        date: normalizedDate,
      },
    },
    update: {
      completed,
    },
    create: {
      habitId,
      date: normalizedDate,
      completed,
    },
  });

  revalidatePath("/dashboard"); // refresh the home page
}