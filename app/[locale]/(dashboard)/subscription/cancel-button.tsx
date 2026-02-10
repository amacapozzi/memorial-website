"use client";

import { useState } from "react";
import { cancelSubscription } from "@/actions/subscription";
import { Button } from "@/components/ui/button";

export function CancelSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    setIsLoading(true);
    const result = await cancelSubscription();
    setIsLoading(false);

    if (!result.success) {
      alert(result.error || "Failed to cancel subscription");
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleCancel}
      disabled={isLoading}
    >
      {isLoading ? "Cancelling..." : "Cancel Subscription"}
    </Button>
  );
}
