import {
  MercadoPagoConfig,
  PreApproval,
  PreApprovalPlan,
  Payment,
} from "mercadopago";
import { BillingCycle } from "./generated/prisma/client";

if (!process.env.MP_ACCESS_TOKEN) {
  console.warn("MP_ACCESS_TOKEN not configured");
}

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export const preApproval = new PreApproval(client);
export const preApprovalPlan = new PreApprovalPlan(client);
export const payment = new Payment(client);

export async function createSubscriptionCheckout(params: {
  planMpId: string;
  userId: string;
  userEmail: string;
  billingCycle: BillingCycle;
}): Promise<string> {
  const subscription = await preApproval.create({
    body: {
      preapproval_plan_id: params.planMpId,
      payer_email: params.userEmail,
      external_reference: params.userId,
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
      status: "authorized",
    },
  });

  if (!subscription.init_point) {
    throw new Error("Failed to create subscription checkout");
  }

  return subscription.init_point;
}

export async function cancelMpSubscription(subscriptionId: string): Promise<void> {
  await preApproval.update({
    id: subscriptionId,
    body: {
      status: "cancelled",
    },
  });
}

export async function getMpSubscription(subscriptionId: string) {
  return preApproval.get({ id: subscriptionId });
}

export async function getMpPayment(paymentId: string) {
  return payment.get({ id: paymentId });
}

// Map Mercado Pago status to our status
export function mapMpStatus(
  mpStatus: string
): "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "PAUSED" {
  switch (mpStatus) {
    case "authorized":
    case "active":
      return "ACTIVE";
    case "pending":
      return "TRIALING";
    case "paused":
      return "PAUSED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "PAST_DUE";
  }
}
