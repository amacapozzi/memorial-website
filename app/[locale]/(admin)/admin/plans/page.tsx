import { getAllPlans } from "@/actions/admin";
import { PlansClient } from "./plans-client";

export default async function AdminPlansPage() {
  const plans = await getAllPlans();

  return <PlansClient initialPlans={plans} />;
}
