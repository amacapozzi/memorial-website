"use client";

import * as React from "react";
import { useActionState, useState } from "react";
import {
  linkWhatsApp,
  unlinkWhatsApp,
  type LinkWhatsAppState,
} from "@/actions/connections";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2, ShieldCheck, Unlink, X } from "lucide-react";

const initialState: LinkWhatsAppState = {};

export function WhatsAppLinkForm({ mode }: { mode: "connect" | "disconnect" }) {
  const [state, formAction, isPending] = useActionState(
    linkWhatsApp,
    initialState,
  );
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    await unlinkWhatsApp();
    setIsDisconnecting(false);
  };

  if (mode === "disconnect") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isDisconnecting}>
            {isDisconnecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="mr-2 h-4 w-4" />
            )}
            Disconnect
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="overflow-hidden p-0 sm:max-w-[520px]">
          {/* subtle top glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-violet-500/10 via-emerald-400/5 to-transparent" />

          <div className="relative p-6">
            <AlertDialogCancel asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 h-9 w-9 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogCancel>

            <AlertDialogHeader className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border bg-background shadow-sm">
                  <Unlink className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <AlertDialogTitle className="text-xl">
                    Disconnect WhatsApp?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm leading-relaxed">
                    You will stop receiving reminders on WhatsApp. You can
                    reconnect anytime by requesting a new linking code.
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>

            <div className="mt-5 rounded-2xl border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                This action is reversible — you can link again whenever you
                want.
              </p>
            </div>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel asChild>
                <Button variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  onClick={handleDisconnect}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDisconnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    "Disconnect"
                  )}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // CONNECT MODE (dialog like your screenshot, but with shadcn InputOTP)
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="rounded-xl">
          Link WhatsApp
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="overflow-hidden p-0 sm:max-w-[640px]">
        {/* Background (soft + futuristic) */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_10%,rgba(139,92,246,0.18),transparent_60%),radial-gradient(60%_50%_at_90%_20%,rgba(16,185,129,0.14),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-foreground/5 to-transparent" />

        <form action={formAction} className="relative">
          <div className="relative p-6">
            <AlertDialogCancel asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 h-9 w-9 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogCancel>

            <AlertDialogHeader className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border bg-background shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-1">
                  <AlertDialogTitle className="text-xl">
                    Secure your WhatsApp link
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm leading-relaxed">
                    Enter the <span className="font-medium">6-digit</span> code
                    you received to finish linking. This keeps your account safe
                    and verified.
                  </AlertDialogDescription>
                </div>
              </div>

              {/* Step pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border bg-background/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
                  Step 1
                </span>
                <span className="text-xs text-muted-foreground">
                  Verify linking code
                </span>
              </div>
            </AlertDialogHeader>

            {/* Main card area */}
            <div className="mt-5 grid gap-4 rounded-3xl border bg-background/70 p-5 shadow-sm backdrop-blur">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm">
                  6-Digit Code
                </Label>

                {/* shadcn InputOTP */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <InputOTP
                    id="code"
                    name="code"
                    maxLength={6}
                    disabled={isPending}
                    inputMode="text"
                    autoComplete="one-time-code"
                    className="w-full"
                    containerClassName="justify-start"
                  >
                    <InputOTPGroup className="rounded-2xl border bg-muted/30 p-1">
                      <InputOTPSlot
                        index={0}
                        className="h-12 w-12 rounded-xl"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-12 w-12 rounded-xl"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-12 w-12 rounded-xl"
                      />
                      <InputOTPSlot
                        index={3}
                        className="h-12 w-12 rounded-xl"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-12 w-12 rounded-xl"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-12 w-12 rounded-xl"
                      />
                    </InputOTPGroup>
                  </InputOTP>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-12 rounded-2xl px-5"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </div>

                {/* Errors / success */}
                <div className="space-y-1">
                  {state.errors?.code && (
                    <p className="text-sm text-destructive">
                      {state.errors.code[0]}
                    </p>
                  )}
                  {state.errors?._form && (
                    <p className="text-sm text-destructive">
                      {state.errors._form[0]}
                    </p>
                  )}
                  {state.success && (
                    <p className="text-sm text-emerald-600">
                      WhatsApp linked successfully!
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">
                  Tip: if you didn’t receive the code, request a new one from
                  the WhatsApp linking screen and try again.
                </p>
              </div>
            </div>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline" className="rounded-xl">
                  Cancel
                </Button>
              </AlertDialogCancel>
              {/* The primary action is the submit button above (Confirm).
                  Keeping footer minimal like the screenshot. */}
            </AlertDialogFooter>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
