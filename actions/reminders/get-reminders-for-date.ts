"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ReminderWithUser } from "./get-reminders";

export async function getRemindersForDate(
  dateStr: string
): Promise<ReminderWithUser[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const date = new Date(dateStr);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const reminders = await prisma.reminder.findMany({
    where: {
      userId: session.user.id,
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { scheduledAt: "asc" },
    select: {
      id: true,
      originalText: true,
      reminderText: true,
      scheduledAt: true,
      status: true,
      recurrence: true,
      recurrenceDay: true,
      recurrenceTime: true,
      calendarEventId: true,
      createdAt: true,
    },
  });

  return reminders;
}
