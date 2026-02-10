"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function disconnectConnector(
  connectorId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    switch (connectorId) {
      case "whatsapp":
        await prisma.user.update({
          where: { id: session.user.id },
          data: { chatId: null },
        });
        break;

      case "gmail":
        await prisma.emailToken.deleteMany({
          where: { userId: session.user.id },
        });
        break;

      case "googleCalendar":
        await prisma.account.deleteMany({
          where: {
            userId: session.user.id,
            provider: "google",
          },
        });
        break;

      default:
        return { success: false, error: "Unknown connector" };
    }

    revalidatePath("/integrations");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to disconnect" };
  }
}
