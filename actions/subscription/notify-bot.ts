export async function notifyBotSubscriptionActivated(userId: string) {
  const botUrl = process.env.BOT_WEBHOOK_URL;
  const secret = process.env.BOT_WEBHOOK_SECRET;
  if (!botUrl || !secret) return;

  try {
    await fetch(`${botUrl}/webhook/subscription-activated`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": secret,
      },
      body: JSON.stringify({ userId }),
    });
  } catch {
    // Non-critical: don't fail the subscription flow if notification fails
  }
}
