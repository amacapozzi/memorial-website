"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  return subscription;
}

export async function getPlans() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return plans;
}

export async function getPlanById(id: string) {
  const plan = await prisma.plan.findUnique({
    where: { id },
  });

  return plan;
}
