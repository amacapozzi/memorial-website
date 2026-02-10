"use client";

import { useState } from "react";
import { Plan, BillingCycle } from "@/lib/generated/prisma/client";
import { createCheckout } from "@/actions/subscription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

function formatPrice(cents: number, currency: string = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function PlanCard({
  plan,
  billingCycle,
  isCurrentPlan = false,
  locale,
}: {
  plan: Plan;
  billingCycle: BillingCycle;
  isCurrentPlan?: boolean;
  locale?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const price = billingCycle === "MONTHLY" ? plan.priceMonthly : plan.priceYearly;
  const features = plan.features as string[];

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const result = await createCheckout(plan.id, billingCycle, locale);
      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        alert(result.error || "Failed to create checkout");
      }
    } catch {
      alert("An error occurred");
    }
    setIsLoading(false);
  };

  return (
    <Card className={isCurrentPlan ? "border-primary" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          {isCurrentPlan && <Badge>Current Plan</Badge>}
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <span className="text-3xl font-bold">{formatPrice(price, plan.currency)}</span>
          <span className="text-muted-foreground">
            /{billingCycle === "MONTHLY" ? "month" : "year"}
          </span>
        </div>

        {plan.trialDays > 0 && (
          <p className="text-sm text-muted-foreground">
            {plan.trialDays} day free trial
          </p>
        )}

        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
          {plan.maxReminders && (
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Up to {plan.maxReminders} reminders
            </li>
          )}
          {plan.hasCalendarSync && (
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Google Calendar sync
            </li>
          )}
          {plan.hasEmailSync && (
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Email integration
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={isCurrentPlan || isLoading}
          onClick={handleSubscribe}
        >
          {isLoading
            ? "Processing..."
            : isCurrentPlan
            ? "Current Plan"
            : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  );
}
