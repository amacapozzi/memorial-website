"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { Sparkles, Zap, Search, Terminal } from "lucide-react";
import type { ConnectorDefinition } from "@/lib/connectors/types";
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
import {
  WhatsApp,
  Gmail,
  GoogleCalendar,
  GitHub,
  XformerlyTwitter,
} from "@/components/icons/integrations";
import { WhatsAppCodeDialog } from "./whatsapp-code-dialog";
import { OAuthConnectDialog } from "./oauth-connect-dialog";
import { DisconnectDialog } from "./disconnect-dialog";

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  whatsapp: WhatsApp,
  gmail: Gmail,
  googleCalendar: GoogleCalendar,
  github: GitHub,
  x: XformerlyTwitter,
};

const badgeIcons = {
  ai: Sparkles,
  automations: Zap,
  search: Search,
  commands: Terminal,
};

interface ConnectorCardProps {
  connector: ConnectorDefinition;
  connected: boolean;
  compatibleWithTemplate?: string;
}

export function ConnectorCard({
  connector,
  connected,
  compatibleWithTemplate = "Compatible with {feature}",
}: ConnectorCardProps) {
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [showOAuthDialog, setShowOAuthDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(connected);

  const Icon = iconMap[connector.iconId];

  function handleToggle(checked: boolean) {
    if (connector.comingSoon) return;

    if (checked) {
      if (connector.type === "code") {
        setShowCodeDialog(true);
      } else {
        setShowOAuthDialog(true);
      }
    } else {
      setShowDisconnectDialog(true);
    }
  }

  function handleConnected() {
    setIsConnected(true);
    setShowCodeDialog(false);
    setShowOAuthDialog(false);
  }

  function handleDisconnected() {
    setIsConnected(false);
    setShowDisconnectDialog(false);
  }

  return (
    <>
      <Card className="font-sans w-full h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2 items-start">
              {Icon && <Icon width={30} height={30} />}
              <div className="flex flex-row items-center gap-x-2">
                <span className="font-medium">{connector.name}</span>
                {connector.comingSoon ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 uppercase text-neutral-400 border border-neutral-600/20"
                  >
                    Coming Soon
                  </Badge>
                ) : (
                  <span
                    className={`text-xs uppercase ${isConnected ? "text-blue-400" : "text-red-400"}`}
                  >
                    {isConnected ? "connected" : "not connected"}
                  </span>
                )}
              </div>
            </div>
            <div>
              <Switch
                checked={isConnected}
                onCheckedChange={handleToggle}
                disabled={connector.comingSoon}
                className="data-[state=checked]:bg-blue-400"
              />
            </div>
          </div>
          <CardDescription>{connector.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex flex-wrap gap-2">
              {connector.badges.map((badge) => {
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

      {connector.type === "code" && (
        <WhatsAppCodeDialog
          open={showCodeDialog}
          onOpenChange={setShowCodeDialog}
          onSuccess={handleConnected}
        />
      )}

      {connector.type === "oauth" && !connector.comingSoon && (
        <OAuthConnectDialog
          open={showOAuthDialog}
          onOpenChange={setShowOAuthDialog}
          connector={connector}
        />
      )}

      <DisconnectDialog
        open={showDisconnectDialog}
        onOpenChange={setShowDisconnectDialog}
        connectorName={connector.name}
        connectorId={connector.id}
        onSuccess={handleDisconnected}
      />
    </>
  );
}
