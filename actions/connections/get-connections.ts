"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ConnectionStatus = {
  whatsapp: {
    connected: boolean;
    chatId: string | null;
  };
  gmail: {
    connected: boolean;
    email: string | null;
    lastSyncAt: Date | null;
  };
  googleCalendar: {
    connected: boolean;
    expiresAt: Date | null;
  };
};

export async function getConnectionStatus(): Promise<ConnectionStatus> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      whatsapp: { connected: false, chatId: null },
      gmail: { connected: false, email: null, lastSyncAt: null },
      googleCalendar: { connected: false, expiresAt: null },
    };
  }

  const [user, emailToken, googleAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chatId: true, email: true },
    }),
    prisma.emailToken.findUnique({
      where: { userId: session.user.id },
      select: { lastSyncAt: true },
    }),
    prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
      select: { expires_at: true },
    }),
  ]);

  return {
    whatsapp: {
      connected: !!user?.chatId,
      chatId: user?.chatId || null,
    },
    gmail: {
      connected: !!emailToken,
      email: user?.email || null,
      lastSyncAt: emailToken?.lastSyncAt || null,
    },
    googleCalendar: {
      connected: !!googleAccount,
      expiresAt: googleAccount?.expires_at
        ? new Date(googleAccount.expires_at * 1000)
        : null,
    },
  };
}
