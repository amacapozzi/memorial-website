import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getMpSubscription,
  getMpPayment,
  mapMpStatus,
} from "@/lib/mercadopago";
import { BillingCycle } from "@/lib/generated/prisma/client";
import { notifyBotSubscriptionActivated } from "@/actions/subscription/notify-bot";

// TODO: Implement proper signature verification with x-signature header
// See: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
function verifyWebhook(_request: NextRequest): boolean { // eslint-disable-line @typescript-eslint/no-unused-vars
  return true;
}

async function findPlanByMpId(mpPlanId: string): Promise<string | null> {
  const plan = await prisma.plan.findFirst({
    where: {
      OR: [{ mpPlanIdMonthly: mpPlanId }, { mpPlanIdYearly: mpPlanId }],
    },
  });
  return plan?.id || null;
}

async function handleSubscriptionUpdate(subscriptionId: string) {
  const mpSub = await getMpSubscription(subscriptionId) as {
    external_reference?: string;
    preapproval_plan_id?: string;
    payer_id?: number;
    status?: string;
    auto_recurring?: { frequency?: number };
    next_payment_date?: string;
  };

  if (!mpSub.external_reference || !mpSub.preapproval_plan_id) {
    console.error("Missing external_reference or preapproval_plan_id");
    return;
  }

  const planId = await findPlanByMpId(mpSub.preapproval_plan_id);
  if (!planId) {
    console.error("Plan not found for MP plan ID:", mpSub.preapproval_plan_id);
    return;
  }

  // Determine billing cycle based on frequency
  const billingCycle: BillingCycle =
    mpSub.auto_recurring?.frequency === 12 ? "YEARLY" : "MONTHLY";

  const status = mapMpStatus(mpSub.status || "pending");

  // Check if subscription already exists (to detect new vs update)
  const existing = await prisma.subscription.findUnique({
    where: { mpSubscriptionId: subscriptionId },
  });

  await prisma.subscription.upsert({
    where: { mpSubscriptionId: subscriptionId },
    create: {
      userId: mpSub.external_reference,
      planId,
      status,
      billingCycle,
      mpSubscriptionId: subscriptionId,
      mpPayerId: mpSub.payer_id?.toString(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: mpSub.next_payment_date
        ? new Date(mpSub.next_payment_date)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    },
    update: {
      status,
      currentPeriodEnd: mpSub.next_payment_date
        ? new Date(mpSub.next_payment_date)
        : undefined,
    },
  });

  // Notify bot for new subscriptions that are active or trialing
  if (!existing && (status === "ACTIVE" || status === "TRIALING")) {
    await notifyBotSubscriptionActivated(mpSub.external_reference);
  }
}

async function handlePaymentUpdate(paymentId: string) {
  const mpPayment = await getMpPayment(paymentId);

  if (!mpPayment.external_reference) {
    console.error("Missing external_reference in payment");
    return;
  }

  // Find subscription by user ID
  const subscription = await prisma.subscription.findUnique({
    where: { userId: mpPayment.external_reference },
  });

  if (!subscription) {
    console.error(
      "Subscription not found for user:",
      mpPayment.external_reference,
    );
    return;
  }

  // Map payment status
  let status: "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" = "PENDING";
  switch (mpPayment.status) {
    case "approved":
      status = "APPROVED";
      break;
    case "rejected":
    case "cancelled":
      status = "REJECTED";
      break;
    case "refunded":
      status = "REFUNDED";
      break;
  }

  // Upsert payment
  await prisma.payment.upsert({
    where: { mpPaymentId: paymentId.toString() },
    create: {
      subscriptionId: subscription.id,
      amount: Math.round((mpPayment.transaction_amount || 0) * 100), // Convert to cents
      currency: mpPayment.currency_id || "ARS",
      status,
      mpPaymentId: paymentId.toString(),
      mpStatus: mpPayment.status,
      paidAt: status === "APPROVED" ? new Date() : null,
    },
    update: {
      status,
      mpStatus: mpPayment.status,
      paidAt: status === "APPROVED" ? new Date() : undefined,
    },
  });

  // Update subscription status if payment approved
  if (status === "APPROVED" && subscription.status !== "ACTIVE") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "ACTIVE" },
    });

    // Notify bot when subscription first becomes active via payment
    await notifyBotSubscriptionActivated(mpPayment.external_reference);
  } else if (status === "APPROVED") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "ACTIVE" },
    });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyWebhook(request)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = await request.json();

    console.log("Webhook received:", body.type, body.data?.id);

    switch (body.type) {
      case "subscription_preapproval":
      case "subscription_preapproval_plan":
        if (body.data?.id) {
          await handleSubscriptionUpdate(body.data.id);
        }
        break;

      case "payment":
        if (body.data?.id) {
          await handlePaymentUpdate(body.data.id);
        }
        break;

      default:
        console.log("Unhandled webhook type:", body.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

// GET endpoint for webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get("challenge");

  if (challenge) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ status: "ok" });
}
