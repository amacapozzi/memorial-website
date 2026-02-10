"use client";

import { useActionState, useState, useRef, useEffect, useMemo } from "react";
import { Plan } from "@/lib/generated/prisma/client";
import { createPlan, updatePlan, type PlanFormState } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FEATURE_SUGGESTIONS = [
  "Recordatorios",
  "Recordatorios recurrentes",
  "Recordatorios ilimitados",
  "Notificaciones por email",
  "Notificaciones por WhatsApp",
  "Notificaciones por SMS",
  "Integración con Gmail",
  "Integración con Google Calendar",
  "Integración con Outlook",
  "Conectores personalizados",
  "Soporte prioritario",
  "Soporte 24/7",
  "Bot de WhatsApp",
  "Bot de Telegram",
  "Exportar datos",
  "Importar contactos",
  "Múltiples usuarios",
  "Panel de administración",
  "Reportes y estadísticas",
  "API access",
  "Personalización de marca",
  "Almacenamiento ilimitado",
  "Backup automático",
  "Sincronización en tiempo real",
  "Plantillas de recordatorios",
  "Categorías personalizadas",
  "Etiquetas",
  "Filtros avanzados",
  "Búsqueda avanzada",
  "Historial de actividad",
];

const initialState: PlanFormState = {};

export function PlanForm({
  plan,
  open,
  onOpenChange,
}: {
  plan?: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEditing = !!plan;
  const [features, setFeatures] = useState<string[]>(
    (plan?.features as string[]) || []
  );
  const [newFeature, setNewFeature] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const featureInputRef = useRef<HTMLInputElement>(null);

  const defaultDiscount = 20;
  const [priceMonthly, setPriceMonthly] = useState(
    plan ? plan.priceMonthly / 100 : 0
  );
  const [discount, setDiscount] = useState(defaultDiscount);

  // Detect if the plan's yearly price was manually set (doesn't match auto-calculated)
  const [yearlyManualOverride, setYearlyManualOverride] = useState(() => {
    if (!plan) return false;
    const expectedYearly =
      (plan.priceMonthly / 100) * 12 * (1 - defaultDiscount / 100);
    return Math.abs(plan.priceYearly / 100 - expectedYearly) > 1;
  });

  const [manualYearlyPrice, setManualYearlyPrice] = useState(
    plan ? plan.priceYearly / 100 : 0
  );

  // Derived yearly price: auto-calculated or manual
  const priceYearly = useMemo(() => {
    if (yearlyManualOverride) return manualYearlyPrice;
    const annual = priceMonthly * 12;
    return Math.round(annual * (1 - discount / 100) * 100) / 100;
  }, [priceMonthly, discount, yearlyManualOverride, manualYearlyPrice]);

  const filteredSuggestions = newFeature.trim()
    ? FEATURE_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(newFeature.toLowerCase()) &&
          !features.includes(s)
      )
    : [];

  const boundAction = isEditing
    ? updatePlan.bind(null, plan.id)
    : createPlan;

  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  const addFeature = (value?: string) => {
    const featureToAdd = value || newFeature.trim();
    if (featureToAdd && !features.includes(featureToAdd)) {
      setFeatures([...features, featureToAdd]);
    }
    setNewFeature("");
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          addFeature(filteredSuggestions[selectedSuggestionIndex]);
        } else {
          addFeature();
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      addFeature();
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && suggestionsRef.current) {
      const item = suggestionsRef.current.children[
        selectedSuggestionIndex
      ] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedSuggestionIndex]);

  const yearlyFullPrice = priceMonthly * 12;
  const yearlySavings = yearlyFullPrice - priceYearly;
  const effectiveDiscount =
    yearlyFullPrice > 0
      ? Math.round((yearlySavings / yearlyFullPrice) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the plan details below."
              : "Fill in the details for the new plan."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {state.errors?._form && (
            <Alert variant="destructive">
              <AlertDescription>{state.errors._form[0]}</AlertDescription>
            </Alert>
          )}

          <input type="hidden" name="features" value={JSON.stringify(features)} />
          <input type="hidden" name="priceMonthly" value={priceMonthly} />
          <input type="hidden" name="priceYearly" value={priceYearly} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={plan?.name || ""}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={plan?.sortOrder || 0}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              defaultValue={plan?.description || ""}
              disabled={isPending}
            />
          </div>

          {/* Pricing Section */}
          <div className="space-y-3 rounded-lg border p-4">
            <h3 className="text-sm font-medium">Pricing</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="priceMonthlyInput">Monthly Price ($)</Label>
                <Input
                  id="priceMonthlyInput"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceMonthly}
                  onChange={(e) => {
                    setPriceMonthly(Number(e.target.value));
                    setYearlyManualOverride(false);
                  }}
                  required
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountInput">Yearly Discount (%)</Label>
                <Input
                  id="discountInput"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => {
                    setDiscount(Number(e.target.value));
                    setYearlyManualOverride(false);
                  }}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="priceYearlyInput">Yearly Price ($)</Label>
                {yearlyManualOverride && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                    onClick={() => setYearlyManualOverride(false)}
                  >
                    Reset to auto-calculated
                  </button>
                )}
              </div>
              <Input
                id="priceYearlyInput"
                type="number"
                step="0.01"
                min="0"
                value={priceYearly}
                onChange={(e) => {
                  setManualYearlyPrice(Number(e.target.value));
                  setYearlyManualOverride(true);
                }}
                required
                disabled={isPending}
              />
              {priceMonthly > 0 && (
                <p className="text-xs text-muted-foreground">
                  Full annual: ${yearlyFullPrice.toLocaleString("es-AR")} |
                  Discount: {effectiveDiscount}% (${yearlySavings.toLocaleString("es-AR")} off)
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mpPlanIdMonthly">MP Monthly Plan ID</Label>
              <Input
                id="mpPlanIdMonthly"
                name="mpPlanIdMonthly"
                defaultValue={plan?.mpPlanIdMonthly || ""}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mpPlanIdYearly">MP Yearly Plan ID</Label>
              <Input
                id="mpPlanIdYearly"
                name="mpPlanIdYearly"
                defaultValue={plan?.mpPlanIdYearly || ""}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxReminders">Max Reminders</Label>
              <Input
                id="maxReminders"
                name="maxReminders"
                type="number"
                defaultValue={plan?.maxReminders || ""}
                placeholder="Unlimited"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxEmailAccounts">Max Email Accounts</Label>
              <Input
                id="maxEmailAccounts"
                name="maxEmailAccounts"
                type="number"
                defaultValue={plan?.maxEmailAccounts || ""}
                placeholder="Unlimited"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trialDays">Trial Days</Label>
              <Input
                id="trialDays"
                name="trialDays"
                type="number"
                defaultValue={plan?.trialDays || 0}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCalendarSync"
                name="hasCalendarSync"
                defaultChecked={plan?.hasCalendarSync || false}
                disabled={isPending}
              />
              <Label htmlFor="hasCalendarSync">Calendar Sync</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasEmailSync"
                name="hasEmailSync"
                defaultChecked={plan?.hasEmailSync || false}
                disabled={isPending}
              />
              <Label htmlFor="hasEmailSync">Email Sync</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasEmailReply"
                name="hasEmailReply"
                defaultChecked={plan?.hasEmailReply || false}
                disabled={isPending}
              />
              <Label htmlFor="hasEmailReply">Email Reply</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                name="isActive"
                defaultChecked={plan?.isActive ?? true}
                disabled={isPending}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          {/* Features Section with Autocomplete */}
          <div className="space-y-2">
            <Label>Features</Label>
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  ref={featureInputRef}
                  value={newFeature}
                  onChange={(e) => {
                    setNewFeature(e.target.value);
                    setShowSuggestions(true);
                    setSelectedSuggestionIndex(-1);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => {
                    // Delay to allow click on suggestion
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="Add a feature..."
                  onKeyDown={handleFeatureKeyDown}
                />
                <Button type="button" variant="outline" onClick={() => addFeature()}>
                  Add
                </Button>
              </div>

              {/* Autocomplete dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <ul
                  ref={suggestionsRef}
                  className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <li
                      key={suggestion}
                      className={`cursor-pointer rounded-sm px-3 py-2 text-sm transition-colors ${
                        index === selectedSuggestionIndex
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addFeature(suggestion);
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded bg-muted p-2 text-sm"
                >
                  {feature}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
