"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteContact(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { chatId: true },
  });

  if (!user?.chatId) {
    return { success: false, error: "No WhatsApp linked" };
  }

  // Verify ownership
  const contact = await prisma.contact.findFirst({
    where: { id, chatId: user.chatId },
  });

  if (!contact) {
    return { success: false, error: "Contact not found" };
  }

  try {
    await prisma.contact.delete({ where: { id } });
    revalidatePath("/reminders");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete contact" };
  }
}
