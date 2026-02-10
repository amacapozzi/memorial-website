"use client";

import { useState } from "react";
import { Plan, BillingCycle } from "@/lib/generated/prisma/client";
import { PlanCard } from "./plan-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PricingTable({
  plans,
  currentPlanId,
  locale,
}: {
  plans: Plan[];
  currentPlanId?: string;
  locale?: string;
}) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Tabs
          value={billingCycle}
          onValueChange={(value) => setBillingCycle(value as BillingCycle)}
        >
          <TabsList>
            <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
            <TabsTrigger value="YEARLY">
              Yearly
              <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                Save 20%
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            isCurrentPlan={plan.id === currentPlanId}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
