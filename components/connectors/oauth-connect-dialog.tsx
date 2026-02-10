"use client";

import { useParams } from "next/navigation";
import type { ConnectorDefinition } from "@/lib/connectors/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const OAUTH_ROUTES: Record<string, string> = {
  gmail: "/api/auth/gmail",
  googleCalendar: "/api/auth/google",
};

interface OAuthConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connector: ConnectorDefinition;
}

export function OAuthConnectDialog({
  open,
  onOpenChange,
  connector,
}: OAuthConnectDialogProps) {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "en";

  function handleConnect() {
    const route = OAUTH_ROUTES[connector.id];
    if (route) {
      window.location.href = `${route}?locale=${locale}`;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {connector.name}</DialogTitle>
          <DialogDescription>{connector.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect}>Continue with Google</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
