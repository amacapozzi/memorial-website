"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReminderStatus, RecurrenceType } from "@/lib/generated/prisma/client";

export type ReminderWithUser = {
  id: string;
  originalText: string;
  reminderText: string;
  scheduledAt: Date;
  status: ReminderStatus;
  recurrence: RecurrenceType;
  recurrenceDay: number | null;
  recurrenceTime: string | null;
  calendarEventId: string | null;
  createdAt: Date;
};

export type GetRemindersParams = {
  status?: ReminderStatus;
  page?: number;
  limit?: number;
};

export type GetRemindersResult = {
  reminders: ReminderWithUser[];
  total: number;
  page: number;
  totalPages: number;
};

export async function getReminders(
  params: GetRemindersParams = {},
): Promise<GetRemindersResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { reminders: [], total: 0, page: 1, totalPages: 0 };
  }

  const { status, page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const where = {
    userId: session.user.id,
    ...(status && { status }),
  };

  const [reminders, total] = await Promise.all([
    prisma.reminder.findMany({
      where,
      orderBy: { scheduledAt: "desc" },
      skip,
      take: limit,
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
    }),
    prisma.reminder.count({ where }),
  ]);

  return {
    reminders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getReminderStats() {
  const session = await auth();

  if (!session?.user?.id) {
    return { pending: 0, sent: 0, failed: 0, cancelled: 0, total: 0 };
  }

  const stats = await prisma.reminder.groupBy({
    by: ["status"],
    where: { userId: session.user.id },
    _count: { status: true },
  });

  const result = {
    pending: 0,
    sent: 0,
    failed: 0,
    cancelled: 0,
    total: 0,
  };

  for (const stat of stats) {
    const key = stat.status.toLowerCase() as keyof typeof result;
    result[key] = stat._count.status;
    result.total += stat._count.status;
  }

  return result;
}
