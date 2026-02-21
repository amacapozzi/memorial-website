"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type AddContactResult = {
  success: boolean;
  error?: string;
};

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("54")) return digits;
  if (digits.startsWith("0")) return "54" + digits.slice(1);
  if (digits.length === 10) return "54" + digits;
  return digits;
}

export async function addContact(
  name: string,
  phone: string,
  alias?: string,
): Promise<AddContactResult> {
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

  if (!name.trim()) return { success: false, error: "Name is required" };
  if (!phone.trim()) return { success: false, error: "Phone is required" };

  const normalizedPhone = normalizePhone(phone);

  try {
    await prisma.contact.upsert({
      where: { chatId_name: { chatId: user.chatId, name: name.trim() } },
      create: {
        chatId: user.chatId,
        name: name.trim(),
        phone: normalizedPhone,
        alias: alias?.trim() || null,
      },
      update: {
        phone: normalizedPhone,
        alias: alias?.trim() || null,
      },
    });

    revalidatePath("/contacts");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save contact" };
  }
}
