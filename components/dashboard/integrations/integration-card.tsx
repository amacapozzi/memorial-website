"use client";

import { useState } from "react";
import { Sparkles, Zap, Search, Terminal } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";

export interface IntegrationBadge {
  label: string;
  icon: "ai" | "automations" | "search" | "commands";
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  iconNode: ComponentType<SVGProps<SVGSVGElement>>;
  glowColor: string;
  enabled?: boolean;
  badges: IntegrationBadge[];
}

const badgeIcons = {
  ai: Sparkles,
  automations: Zap,
  search: Search,
  commands: Terminal,
};

interface IntegrationCardProps {
  integration: Integration;
  compatibleWithTemplate: string;
}

export function IntegrationCard({
  integration,
  compatibleWithTemplate,
}: IntegrationCardProps) {
  const [enabled, setEnabled] = useState(false);

  const Icon = integration.iconNode;

  return (
    <Card className="font-sans w-fit">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2 items-start">
            <Icon width={30} height={30} />
            <div className="flex flex-row items-center gap-x-2">
              <span className="font-medium">{integration.name}</span>
              <span
                className={`text-xs uppercase ${enabled ? "text-blue-400" : "text-red-400"}`}
              >
                {enabled ? "connected" : "not connected"}
              </span>
            </div>
          </div>
          <div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              className="data-[state=checked]:bg-blue-400"
            />
          </div>
        </div>
        <CardDescription>{integration.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {integration.badges.map((badge) => {
              const BadgeIcon = badgeIcons[badge.icon];
              const tooltipText = compatibleWithTemplate.replace(
                "{feature}",
                badge.label,
              );
              return (
                <Tooltip key={badge.label}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-default px-2 py-1 border border-gray-600/20 text-neutral-300"
                    >
                      <BadgeIcon className="mr-1" size={14} />
                      {badge.label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>{tooltipText}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
