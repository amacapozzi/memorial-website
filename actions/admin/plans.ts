"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priceMonthly: z.number().min(0),
  priceYearly: z.number().min(0),
  currency: z.string().default("ARS"),
  mpPlanIdMonthly: z.string().optional(),
  mpPlanIdYearly: z.string().optional(),
  features: z.array(z.string()).default([]),
  maxReminders: z.number().nullable().optional(),
  maxEmailAccounts: z.number().nullable().optional(),
  hasCalendarSync: z.boolean().default(false),
  hasEmailSync: z.boolean().default(false),
  hasEmailReply: z.boolean().default(false),
  trialDays: z.number().default(0),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export type PlanFormState = {
  errors?: {
    name?: string[];
    priceMonthly?: string[];
    priceYearly?: string[];
    _form?: string[];
  };
  success?: boolean;
};

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function createPlan(
  prevState: PlanFormState,
  formData: FormData
): Promise<PlanFormState> {
  const session = await checkAdminAuth();
  if (!session) {
    return { errors: { _form: ["Not authorized"] } };
  }

  const features = formData.get("features");
  const parsedFeatures = features ? JSON.parse(features as string) : [];

  const validatedFields = planSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    priceMonthly: Math.round(Number(formData.get("priceMonthly")) * 100),
    priceYearly: Math.round(Number(formData.get("priceYearly")) * 100),
    currency: formData.get("currency") || "ARS",
    mpPlanIdMonthly: formData.get("mpPlanIdMonthly") || undefined,
    mpPlanIdYearly: formData.get("mpPlanIdYearly") || undefined,
    features: parsedFeatures,
    maxReminders: formData.get("maxReminders")
      ? Number(formData.get("maxReminders"))
      : null,
    maxEmailAccounts: formData.get("maxEmailAccounts")
      ? Number(formData.get("maxEmailAccounts"))
      : null,
    hasCalendarSync: !!formData.get("hasCalendarSync"),
    hasEmailSync: !!formData.get("hasEmailSync"),
    hasEmailReply: !!formData.get("hasEmailReply"),
    trialDays: Number(formData.get("trialDays")) || 0,
    isActive: !!formData.get("isActive"),
    sortOrder: Number(formData.get("sortOrder")) || 0,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as PlanFormState["errors"],
    };
  }

  try {
    await prisma.plan.create({
      data: validatedFields.data,
    });

    revalidatePath("/admin/plans");
    return { success: true };
  } catch {
    return { errors: { _form: ["Failed to create plan"] } };
  }
}

export async function updatePlan(
  id: string,
  prevState: PlanFormState,
  formData: FormData
): Promise<PlanFormState> {
  const session = await checkAdminAuth();
  if (!session) {
    return { errors: { _form: ["Not authorized"] } };
  }

  const features = formData.get("features");
  const parsedFeatures = features ? JSON.parse(features as string) : [];

  const validatedFields = planSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    priceMonthly: Math.round(Number(formData.get("priceMonthly")) * 100),
    priceYearly: Math.round(Number(formData.get("priceYearly")) * 100),
    currency: formData.get("currency") || "ARS",
    mpPlanIdMonthly: formData.get("mpPlanIdMonthly") || undefined,
    mpPlanIdYearly: formData.get("mpPlanIdYearly") || undefined,
    features: parsedFeatures,
    maxReminders: formData.get("maxReminders")
      ? Number(formData.get("maxReminders"))
      : null,
    maxEmailAccounts: formData.get("maxEmailAccounts")
      ? Number(formData.get("maxEmailAccounts"))
      : null,
    hasCalendarSync: !!formData.get("hasCalendarSync"),
    hasEmailSync: !!formData.get("hasEmailSync"),
    hasEmailReply: !!formData.get("hasEmailReply"),
    trialDays: Number(formData.get("trialDays")) || 0,
    isActive: !!formData.get("isActive"),
    sortOrder: Number(formData.get("sortOrder")) || 0,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors as PlanFormState["errors"],
    };
  }

  try {
    await prisma.plan.update({
      where: { id },
      data: validatedFields.data,
    });

    revalidatePath("/admin/plans");
    return { success: true };
  } catch {
    return { errors: { _form: ["Failed to update plan"] } };
  }
}

export async function deletePlan(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await checkAdminAuth();
  if (!session) {
    return { success: false, error: "Not authorized" };
  }

  // Check if plan has active subscriptions
  const subscriptionCount = await prisma.subscription.count({
    where: { planId: id, status: { in: ["ACTIVE", "TRIALING"] } },
  });

  if (subscriptionCount > 0) {
    return {
      success: false,
      error: "Cannot delete plan with active subscriptions",
    };
  }

  try {
    await prisma.plan.delete({ where: { id } });
    revalidatePath("/admin/plans");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete plan" };
  }
}

export async function getAllPlans() {
  const session = await checkAdminAuth();
  if (!session) {
    return [];
  }

  return prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { subscriptions: true },
      },
    },
  });
}
