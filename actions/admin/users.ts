"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/lib/generated/prisma/client";
import { notifyBotSubscriptionActivated } from "@/actions/subscription/notify-bot";

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export type UserWithStats = {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  chatId: string | null;
  createdAt: Date;
  _count: {
    reminders: number;
  };
  subscription: {
    status: string;
    plan: {
      name: string;
    };
  } | null;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
};

export async function getUsers(params: GetUsersParams = {}) {
  const session = await checkAdminAuth();
  if (!session) {
    return { users: [], total: 0, page: 1, totalPages: 0 };
  }

  const { page = 1, limit = 10, search, role } = params;
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" as const } },
        { name: { contains: search, mode: "insensitive" as const } },
        { chatId: { contains: search } },
      ],
    }),
    ...(role && { role }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        chatId: true,
        createdAt: true,
        _count: {
          select: { reminders: true },
        },
        subscription: {
          select: {
            status: true,
            plan: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users as UserWithStats[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const session = await checkAdminAuth();
  if (!session) {
    return { success: false, error: "Not authorized" };
  }

  // Prevent self-demotion
  if (userId === session.user.id && role !== "ADMIN") {
    return { success: false, error: "Cannot change your own role" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update user role" };
  }
}

export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await checkAdminAuth();
  if (!session) {
    return { success: false, error: "Not authorized" };
  }

  // Prevent self-deletion
  if (userId === session.user.id) {
    return { success: false, error: "Cannot delete your own account" };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete user" };
  }
}

export async function assignPlanToUser(
  userId: string,
  planId: string,
  expiresAt: Date
): Promise<{ success: boolean; error?: string }> {
  const session = await checkAdminAuth();
  if (!session) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    const now = new Date();

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId,
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        currentPeriodStart: now,
        currentPeriodEnd: expiresAt,
      },
      update: {
        planId,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: expiresAt,
        cancelledAt: null,
      },
    });

    await notifyBotSubscriptionActivated(userId);

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to assign plan" };
  }
}

export async function getAdminStats() {
  const session = await checkAdminAuth();
  if (!session) {
    return null;
  }

  const [
    totalUsers,
    activeSubscriptions,
    totalReminders,
    pendingReminders,
    revenueThisMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: { status: { in: ["ACTIVE", "TRIALING"] } },
    }),
    prisma.reminder.count(),
    prisma.reminder.count({ where: { status: "PENDING" } }),
    prisma.payment.aggregate({
      where: {
        status: "APPROVED",
        paidAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    activeSubscriptions,
    totalReminders,
    pendingReminders,
    revenueThisMonth: revenueThisMonth._sum.amount || 0,
  };
}
