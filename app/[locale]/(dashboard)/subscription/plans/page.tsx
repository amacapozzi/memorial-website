import { getPlans, getSubscription } from "@/actions/subscription";
import { PricingTable } from "@/components/subscription";

export default async function PlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const plans = await getPlans();
  const subscription = await getSubscription();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Select the plan that best fits your needs.
        </p>
      </div>

      <PricingTable plans={plans} currentPlanId={subscription?.planId} locale={locale} />
    </div>
  );
}
