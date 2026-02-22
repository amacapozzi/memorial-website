"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const preferencesSchema = z.object({
  digestEnabled: z.boolean(),
  briefEnabled: z.boolean(),
  digestHour: z.number().int().min(5).max(22),
});

export type UpdatePreferencesState = {
  error?: string;
  success?: boolean;
};

export async function updatePreferences(
  data: z.infer<typeof preferencesSchema>
): Promise<UpdatePreferencesState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  const parsed = preferencesSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid data" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        digestEnabled: parsed.data.digestEnabled,
        briefEnabled: parsed.data.briefEnabled,
        digestHour: parsed.data.digestHour,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch {
    return { error: "Failed to save preferences" };
  }
}
