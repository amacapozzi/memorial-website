"use client";

import { useState, useTransition } from "react";
import { assignPlanToUser } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CreditCardIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
};

interface AssignPlanDialogProps {
  userId: string;
  userName: string | null;
  plans: Plan[];
}

export function AssignPlanDialog({
  userId,
  userName,
  plans,
}: AssignPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!planId || !expiresAt) {
      setError("Select a plan and expiration date");
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await assignPlanToUser(userId, planId, expiresAt);
      if (result.success) {
        setOpen(false);
        setPlanId("");
        setExpiresAt(undefined);
      } else {
        setError(result.error || "Failed to assign plan");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CreditCardIcon className="size-3.5" />
          Assign Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Plan</DialogTitle>
          <DialogDescription>
            Assign a subscription plan to {userName || "this user"}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan</label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expires at</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiresAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="size-4" />
                  {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiresAt}
                  onSelect={setExpiresAt}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isPending || !planId || !expiresAt}
            className="w-full"
          >
            {isPending ? "Assigning..." : "Assign Plan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
