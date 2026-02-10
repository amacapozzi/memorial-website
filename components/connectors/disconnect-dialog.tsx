"use client";

import { useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { disconnectConnector } from "@/actions/connections/disconnect";

interface DisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectorName: string;
  connectorId: string;
  onSuccess: () => void;
}

export function DisconnectDialog({
  open,
  onOpenChange,
  connectorName,
  connectorId,
  onSuccess,
}: DisconnectDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectConnector(connectorId);
      if (result.success) {
        onSuccess();
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect {connectorName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the connection. You can reconnect anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDisconnect}
            disabled={isPending}
          >
            {isPending ? "Disconnecting..." : "Disconnect"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
