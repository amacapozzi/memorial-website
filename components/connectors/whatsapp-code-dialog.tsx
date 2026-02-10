"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { linkWhatsApp } from "@/actions/connections/link-whatsapp";
import { RefreshCwIcon } from "lucide-react";

interface WhatsAppCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WhatsAppCodeDialog({
  open,
  onOpenChange,
  onSuccess,
}: WhatsAppCodeDialogProps) {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("code", code.toUpperCase());

    startTransition(async () => {
      const result = await linkWhatsApp({}, formData);

      if (result.success) {
        setCode("");
        toast.success("WhatsApp linked successfully!", {
          description: "Your WhatsApp account is now connected.",
        });
        onSuccess();
      } else {
        const errorMsg =
          result.errors?._form?.[0] ||
          result.errors?.code?.[0] ||
          "Failed to link WhatsApp";
        toast.error("Failed to link", { description: errorMsg });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          sm:max-w-md
          px-6
          py-6
        "
      >
        <DialogHeader className="text-center">
          <DialogTitle>Link WhatsApp</DialogTitle>
          <DialogDescription>
            Send <strong>/connect</strong> to the bot on WhatsApp to get a
            6-character code, then enter it below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>

              <Button
                type="button"
                variant="outline"
                size="xs"
                className="gap-1"
              >
                <RefreshCwIcon className="size-3.5" />
                Resend Code
              </Button>
            </div>

            {/* OTP CENTRADO */}
            <div className="mt-3 flex justify-center">
              <InputOTP
                id="otp-verification"
                maxLength={6}
                value={code}
                onChange={setCode}
                required
              >
                <InputOTPGroup className="gap-1">
                  <InputOTPSlot className="h-12 w-11 text-xl" index={0} />
                  <InputOTPSlot className="h-12 w-11 text-xl" index={1} />
                  <InputOTPSlot className="h-12 w-11 text-xl" index={2} />
                </InputOTPGroup>

                <InputOTPSeparator className="mx-2" />

                <InputOTPGroup className="gap-1">
                  <InputOTPSlot className="h-12 w-11 text-xl" index={3} />
                  <InputOTPSlot className="h-12 w-11 text-xl" index={4} />
                  <InputOTPSlot className="h-12 w-11 text-xl" index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <FieldDescription className="mt-2 text-center">
              <a
                href="#"
                className="underline underline-offset-4 hover:text-muted-foreground"
              >
                I no longer have access to this email address.
              </a>
            </FieldDescription>
          </Field>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={code.length !== 6 || isPending}
              className="bg-white text-black hover:bg-white/90"
            >
              {isPending ? "Linking..." : "Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
