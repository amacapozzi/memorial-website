"use client";

import { useState, useRef } from "react";
import { addContact } from "@/actions/contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Phone, User, Tag } from "lucide-react";

export function AddContactDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const alias = data.get("alias") as string;

    const result = await addContact(name, phone, alias || undefined);

    if (result.success) {
      setOpen(false);
      formRef.current?.reset();
    } else {
      setError(result.error ?? "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="size-4" />
          Add contact
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md p-0 gap-0 overflow-hidden border-white/[0.08]"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <DialogTitle className="text-[15px] font-semibold">
            New contact
          </DialogTitle>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </DialogHeader>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="flex flex-col gap-0 px-5 py-5">
            {/* Name field */}
            <div className="flex items-start gap-3 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2 w-24 shrink-0 pt-2">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Name
                </span>
              </div>
              <Input
                name="name"
                required
                placeholder="Full name"
                autoComplete="off"
                className="border-0 shadow-none bg-transparent focus-visible:ring-0 px-0 h-auto py-1.5 text-sm placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Phone field */}
            <div className="flex items-start gap-3 py-3 border-b border-white/[0.05]">
              <div className="flex items-center gap-2 w-24 shrink-0 pt-2">
                <Phone className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Phone
                </span>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <Input
                  name="phone"
                  required
                  type="tel"
                  placeholder="1122334455"
                  autoComplete="off"
                  className="border-0 shadow-none bg-transparent focus-visible:ring-0 px-0 h-auto py-1.5 text-sm placeholder:text-muted-foreground/50"
                />
                <p className="text-[11px] text-muted-foreground/50 pb-0.5">
                  Argentina: enter 10 digits (country code added automatically)
                </p>
              </div>
            </div>

            {/* Alias field */}
            <div className="flex items-start gap-3 py-3">
              <div className="flex items-center gap-2 w-24 shrink-0 pt-2">
                <Tag className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Alias
                </span>
              </div>
              <Input
                name="alias"
                placeholder="Nickname or short alias (optional)"
                autoComplete="off"
                className="border-0 shadow-none bg-transparent focus-visible:ring-0 px-0 h-auto py-1.5 text-sm placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="px-5 pb-3 text-xs text-destructive">{error}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="gap-2">
              <UserPlus className="size-3.5" />
              {loading ? "Saving…" : "Add contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
