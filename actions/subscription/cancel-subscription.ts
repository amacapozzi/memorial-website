"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelMpSubscription } from "@/lib/mercadopago";
import { revalidatePath } from "next/cache";

export type CancelSubscriptionResult = {
  success: boolean;
  error?: string;
};

export async function cancelSubscription(): Promise<CancelSubscriptionResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

  if (!subscription) {
    return { success: false, error: "No subscription found" };
  }

  if (subscription.status === "CANCELLED") {
    return { success: false, error: "Subscription is already cancelled" };
  }

  try {
    // Cancel in Mercado Pago if there's a MP subscription
    if (subscription.mpSubscriptionId) {
      await cancelMpSubscription(subscription.mpSubscriptionId);
    }

    // Update in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    revalidatePath("/subscription");
    return { success: true };
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}
