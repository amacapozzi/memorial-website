import type { ContactItem } from "@/actions/contacts";
import { ContactCard } from "./contact-card";
import { AddContactDialog } from "./add-contact-dialog";
import { Users } from "lucide-react";
import Link from "next/link";

function EmptyState({ hasWhatsApp }: { hasWhatsApp: boolean }) {
  if (!hasWhatsApp) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No WhatsApp linked</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Link your WhatsApp account in{" "}
          <Link href="/settings" className="underline underline-offset-2 hover:text-foreground">
            Settings
          </Link>{" "}
          to start managing contacts.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.03]">
        <Users className="size-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No contacts yet</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        Add your first contact using the button above, or via WhatsApp:{" "}
        <em>&quot;agrega a Juan con el 1122334455&quot;</em>
      </p>
    </div>
  );
}

export function ContactList({
  contacts,
  hasWhatsApp,
}: {
  contacts: ContactItem[];
  hasWhatsApp: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* List header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {contacts.length === 0
              ? "No contacts"
              : contacts.length === 1
                ? "1 contact"
                : `${contacts.length} contacts`}
          </span>
        </div>
        {hasWhatsApp && <AddContactDialog />}
      </div>

      {/* Grid or empty state */}
      {contacts.length === 0 ? (
        <EmptyState hasWhatsApp={hasWhatsApp} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contacts.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </div>
      )}
    </div>
  );
}
