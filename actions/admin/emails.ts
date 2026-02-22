"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export type UserForSelect = {
  id: string;
  email: string | null;
  name: string | null;
};

export type ProcessedEmailRow = {
  id: string;
  gmailMessageId: string;
  subject: string | null;
  sender: string | null;
  receivedAt: Date;
  processedAt: Date;
  status: string;
  emailType: string | null;
};

export async function getUsersForSelect(): Promise<UserForSelect[]> {
  const session = await checkAdminAuth();
  if (!session) return [];

  return prisma.user.findMany({
    select: { id: true, email: true, name: true },
    orderBy: { email: "asc" },
  });
}

export type GetUserEmailsParams = {
  userId: string;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getUserEmails(params: GetUserEmailsParams): Promise<{
  emails: ProcessedEmailRow[];
  total: number;
  totalPages: number;
}> {
  const session = await checkAdminAuth();
  if (!session) return { emails: [], total: 0, totalPages: 0 };

  const { userId, search = "", page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(search && {
      OR: [
        { subject: { contains: search, mode: "insensitive" as const } },
        { sender: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [emails, total] = await Promise.all([
    prisma.processedEmail.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        gmailMessageId: true,
        subject: true,
        sender: true,
        receivedAt: true,
        processedAt: true,
        status: true,
        emailType: true,
      },
    }),
    prisma.processedEmail.count({ where }),
  ]);

  return {
    emails,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
