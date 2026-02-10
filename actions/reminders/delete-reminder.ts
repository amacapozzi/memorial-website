"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type DeleteReminderResult = {
  success: boolean;
  error?: string;
};

export async function deleteReminder(id: string): Promise<DeleteReminderResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!reminder) {
    return { success: false, error: "Reminder not found" };
  }

  try {
    await prisma.reminder.delete({
      where: { id },
    });

    revalidatePath("/reminders");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete reminder" };
  }
}

export async function cancelReminder(id: string): Promise<DeleteReminderResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Verify ownership
  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!reminder) {
    return { success: false, error: "Reminder not found" };
  }

  try {
    await prisma.reminder.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/reminders");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to cancel reminder" };
  }
}
