"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ContactItem = {
  id: string;
  name: string;
  phone: string;
  alias: string | null;
  createdAt: Date;
};

export async function getContacts(): Promise<ContactItem[]> {
  const session = await auth();

  if (!session?.user?.id) return [];

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { chatId: true },
  });

  if (!user?.chatId) return [];

  return prisma.contact.findMany({
    where: { chatId: user.chatId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true, alias: true, createdAt: true },
  });
}

export async function getContactsData(): Promise<{
  contacts: ContactItem[];
  hasWhatsApp: boolean;
}> {
  const session = await auth();

  if (!session?.user?.id) return { contacts: [], hasWhatsApp: false };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { chatId: true },
  });

  if (!user?.chatId) return { contacts: [], hasWhatsApp: false };

  const contacts = await prisma.contact.findMany({
    where: { chatId: user.chatId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true, alias: true, createdAt: true },
  });

  return { contacts, hasWhatsApp: true };
}
