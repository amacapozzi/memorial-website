"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscriptionCheckout } from "@/lib/mercadopago";
import { BillingCycle } from "@/lib/generated/prisma/client";

export type CreateCheckoutResult = {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
};

export async function createCheckout(
  planId: string,
  billingCycle: BillingCycle,
  locale?: string
): Promise<CreateCheckoutResult> {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return { success: false, error: "Not authenticated" };
  }

  // Save user's locale preference
  if (locale) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { locale },
    });
  }

  // Get the plan
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return { success: false, error: "Plan not found" };
  }

  // Get the MP plan ID based on billing cycle
  const mpPlanId =
    billingCycle === "MONTHLY" ? plan.mpPlanIdMonthly : plan.mpPlanIdYearly;

  if (!mpPlanId) {
    return { success: false, error: "Plan not configured for payments" };
  }

  // Check if user already has an active subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (existingSubscription && existingSubscription.status === "ACTIVE") {
    return { success: false, error: "You already have an active subscription" };
  }

  try {
    const checkoutUrl = await createSubscriptionCheckout({
      planMpId: mpPlanId,
      userId: session.user.id,
      userEmail: session.user.email,
      billingCycle,
    });

    return { success: true, checkoutUrl };
  } catch (error) {
    console.error("Failed to create checkout:", error);
    return { success: false, error: "Failed to create checkout" };
  }
}
