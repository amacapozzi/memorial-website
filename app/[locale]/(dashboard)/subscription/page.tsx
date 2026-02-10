import { getSubscription, getPlans } from "@/actions/subscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Locale } from "@/i18n/config";
import { CancelSubscriptionButton } from "./cancel-button";

function formatPrice(cents: number, currency: string = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const subscription = await getSubscription();
  const plans = await getPlans();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and billing information.
        </p>
      </div>

      {subscription ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan: {subscription.plan.name}</CardTitle>
                <CardDescription>{subscription.plan.description}</CardDescription>
              </div>
              <Badge
                variant={
                  subscription.status === "ACTIVE"
                    ? "default"
                    : subscription.status === "TRIALING"
                    ? "secondary"
                    : "destructive"
                }
              >
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Billing Cycle</p>
                <p className="font-medium capitalize">
                  {subscription.billingCycle.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-medium">
                  {formatPrice(
                    subscription.billingCycle === "MONTHLY"
                      ? subscription.plan.priceMonthly
                      : subscription.plan.priceYearly,
                    subscription.plan.currency
                  )}
                  /{subscription.billingCycle === "MONTHLY" ? "month" : "year"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Period</p>
                <p className="font-medium">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{" "}
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Billing Date</p>
                <p className="font-medium">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>

            {subscription.trialEndsAt && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">
                  Trial ends on{" "}
                  {new Date(subscription.trialEndsAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Link href={`/${locale}/subscription/plans`}>
              <Button variant="outline">Change Plan</Button>
            </Link>
            {subscription.status !== "CANCELLED" && (
              <CancelSubscriptionButton />
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don&apos;t have an active subscription. Choose a plan to unlock
              premium features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">Available Plans:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {plans.map((plan) => (
                  <li key={plan.id}>
                    {plan.name} - Starting at{" "}
                    {formatPrice(plan.priceMonthly, plan.currency)}/month
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/${locale}/subscription/plans`}>
              <Button>View Plans</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
