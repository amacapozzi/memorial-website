"use client";

import { useState } from "react";
import { deleteContact } from "@/actions/contacts";
import type { ContactItem } from "@/actions/contacts";
import { Button } from "@/components/ui/button";
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
import { Phone, Trash2 } from "lucide-react";

// Warm palette that complements the app's orange primary
const AVATAR_COLORS: [string, string][] = [
  ["#f97316", "#431407"], // orange
  ["#a78bfa", "#2e1065"], // violet
  ["#34d399", "#022c22"], // emerald
  ["#38bdf8", "#0c4a6e"], // sky
  ["#f472b6", "#500724"], // pink
  ["#facc15", "#422006"], // yellow
  ["#fb923c", "#431407"], // amber
];

function getAvatarStyle(name: string): { bg: string; fg: string } {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return { bg: AVATAR_COLORS[idx][1], fg: AVATAR_COLORS[idx][0] };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPhone(phone: string): string {
  if (phone.startsWith("54") && phone.length >= 12) {
    const local = phone.slice(2);
    if (local.length === 10) {
      return `+54 ${local.slice(0, 2)} ${local.slice(2, 6)}-${local.slice(6)}`;
    }
  }
  return `+${phone}`;
}

export function ContactCard({ contact }: { contact: ContactItem }) {
  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const avatar = getAvatarStyle(contact.name);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteContact(contact.id);
    setShowDialog(false);
    setIsDeleting(false);
  };

  return (
    <>
      <div className="group relative flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.04] hover:border-white/[0.10]">
        {/* Delete button — appears on hover */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setShowDialog(true)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-3.5" />
        </Button>

        {/* Avatar + name row */}
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
            style={{ backgroundColor: avatar.bg, color: avatar.fg }}
          >
            {getInitials(contact.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground leading-tight">
              {contact.name}
            </p>
            {contact.alias && (
              <p className="truncate text-xs text-muted-foreground mt-0.5">
                @{contact.alias}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="size-3.5 shrink-0 text-muted-foreground/60" />
          <span className="font-mono tracking-tight">
            {formatPhone(contact.phone)}
          </span>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{contact.name}</strong> from your contacts? This
              can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
