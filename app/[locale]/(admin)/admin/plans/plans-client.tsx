"use client";

import { useState } from "react";
import { Plan } from "@/lib/generated/prisma/client";
import { getAllPlans, deletePlan } from "@/actions/admin";
import { PlanForm } from "@/components/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Pencil, Trash2 } from "lucide-react";

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(cents / 100);
}

type PlanWithCount = Plan & { _count: { subscriptions: number } };

export function PlansClient({
  initialPlans,
}: {
  initialPlans: PlanWithCount[];
}) {
  const [plans, setPlans] = useState<PlanWithCount[]>(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadPlans = async () => {
    const data = await getAllPlans();
    setPlans(data as PlanWithCount[]);
  };

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlan(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      const result = await deletePlan(id);
      if (result.success) {
        loadPlans();
      } else {
        alert(result.error);
      }
    }
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      loadPlans();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Plans</h2>
          <p className="text-muted-foreground">
            Manage subscription plans and pricing.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>{plans.length} plans configured</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Yearly</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Subscriptions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(plan.priceMonthly)}</TableCell>
                  <TableCell>{formatPrice(plan.priceYearly)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plan.maxReminders ? (
                        <p>{plan.maxReminders} reminders</p>
                      ) : (
                        <p>Unlimited reminders</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{plan._count.subscriptions}</TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(plan)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PlanForm
        key={selectedPlan?.id ?? "new"}
        plan={selectedPlan}
        open={isFormOpen}
        onOpenChange={handleFormClose}
      />
    </div>
  );
}
