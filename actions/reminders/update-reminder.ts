"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ReminderStatus, RecurrenceType } from "@/lib/generated/prisma/client";

const updateReminderSchema = z.object({
  id: z.string(),
  reminderText: z.string().min(1).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.nativeEnum(ReminderStatus).optional(),
  recurrence: z.nativeEnum(RecurrenceType).optional(),
  recurrenceDay: z.number().nullable().optional(),
  recurrenceTime: z.string().nullable().optional(),
});

export type UpdateReminderState = {
  errors?: {
    reminderText?: string[];
    scheduledAt?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function updateReminder(
  prevState: UpdateReminderState,
  formData: FormData
): Promise<UpdateReminderState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      errors: { _form: ["Not authenticated"] },
    };
  }

  const validatedFields = updateReminderSchema.safeParse({
    id: formData.get("id"),
    reminderText: formData.get("reminderText") || undefined,
    scheduledAt: formData.get("scheduledAt") || undefined,
    status: formData.get("status") || undefined,
    recurrence: formData.get("recurrence") || undefined,
    recurrenceDay: formData.get("recurrenceDay")
      ? Number(formData.get("recurrenceDay"))
      : undefined,
    recurrenceTime: formData.get("recurrenceTime") || undefined,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as UpdateReminderState["errors"],
    };
  }

  const { id, ...data } = validatedFields.data;

  // Verify ownership
  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!reminder) {
    return {
      errors: { _form: ["Reminder not found"] },
    };
  }

  try {
    await prisma.reminder.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
    });

    revalidatePath("/reminders");
    return { success: true };
  } catch {
    return {
      errors: { _form: ["Failed to update reminder"] },
    };
  }
}
