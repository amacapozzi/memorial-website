"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ReminderWithUser } from "./get-reminders";

export async function getRemindersForMonth(
  monthStr: string,
): Promise<ReminderWithUser[]> {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const [year, month] = monthStr.split("-").map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return [];
  }

  const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const reminders = await prisma.reminder.findMany({
    where: {
      userId: session.user.id,
      scheduledAt: {
        gte: startOfMonth,
        lte: endOfMonth,
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
