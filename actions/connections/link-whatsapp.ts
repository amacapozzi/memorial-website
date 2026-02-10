"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const linkWhatsAppSchema = z.object({
  code: z.string().length(6, "Code must be 6 characters"),
});

async function notifyBotLinked(chatId: string, username: string, ip: string) {
  const botUrl = process.env.BOT_WEBHOOK_URL;
  const secret = process.env.BOT_WEBHOOK_SECRET;
  if (!botUrl || !secret) return;

  try {
    await fetch(`${botUrl}/webhook/linked`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({ chatId, username, ip }),
    });
  } catch {
    // Non-critical: don't fail the linking if notification fails
  }
}

export type LinkWhatsAppState = {
  errors?: {
    code?: string[];
    _form?: string[];
  };
  success?: boolean;
};

export async function linkWhatsApp(
  _prevState: LinkWhatsAppState,
  formData: FormData
): Promise<LinkWhatsAppState> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      errors: { _form: ["Not authenticated"] },
    };
  }

  const validatedFields = linkWhatsAppSchema.safeParse({
    code: formData.get("code"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { code } = validatedFields.data;

  try {
    // Find valid, unused linking code
    const linkingCode = await prisma.linkingCode.findFirst({
      where: {
        code: code.toUpperCase(),
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
    });

    if (!linkingCode) {
      return {
        errors: { code: ["Invalid or expired code"] },
      };
    }

    // Check if user already has WhatsApp linked
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chatId: true },
    });

    if (currentUser?.chatId) {
      return {
        errors: { _form: ["WhatsApp is already linked to your account"] },
      };
    }

    // Transaction: link chatId to user, merge orphan data, mark code used
    await prisma.$transaction(async (tx) => {
      // Check if there's an orphan user created by the bot for this chatId
      const orphanUser = await tx.user.findUnique({
        where: { chatId: linkingCode.chatId },
        select: { id: true },
      });

      if (orphanUser && orphanUser.id !== session.user!.id) {
        // Migrate reminders from orphan user to authenticated user
        await tx.reminder.updateMany({
          where: { userId: orphanUser.id },
          data: { userId: session.user!.id },
        });

        // Delete the orphan user (cascade will clean up related records)
        await tx.user.delete({ where: { id: orphanUser.id } });
      }

      // Set chatId on authenticated user
      await tx.user.update({
        where: { id: session.user!.id },
        data: { chatId: linkingCode.chatId },
      });

      // Mark code as used
      await tx.linkingCode.update({
        where: { id: linkingCode.id },
        data: { usedAt: new Date(), usedBy: session.user!.id },
      });
    });

    revalidatePath("/integrations");

    // Notify bot to send WhatsApp confirmation message
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "Desconocida";
    const username = session.user.name || session.user.email || "Usuario";
    await notifyBotLinked(linkingCode.chatId, username, ip);

    return { success: true };
  } catch {
    return {
      errors: { _form: ["Failed to link WhatsApp"] },
    };
  }
}

export async function unlinkWhatsApp(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { chatId: null },
    });

    revalidatePath("/integrations");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to unlink WhatsApp" };
  }
}
