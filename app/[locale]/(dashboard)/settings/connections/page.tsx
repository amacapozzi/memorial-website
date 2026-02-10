"use client";

import { useActionState } from "react";
import {
  linkWhatsApp,
  unlinkWhatsApp,
  type LinkWhatsAppState,
} from "@/actions/connections";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Link2, Unlink } from "lucide-react";

const initialState: LinkWhatsAppState = {};

export default function ConnectionsPage() {
  const [state, formAction, isPending] = useActionState(
    linkWhatsApp,
    initialState,
  );

  const handleUnlink = async () => {
    const result = await unlinkWhatsApp();
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Connections</h2>
        <p className="text-muted-foreground">
          Connect your accounts to enable additional features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>
                Connect your WhatsApp to create reminders via voice and text
                messages.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <h4 className="font-medium mb-2">How to connect:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Open WhatsApp and message our bot</li>
              <li>
                Send the command:{" "}
                <code className="bg-background px-1 rounded">link</code>
              </li>
              <li>You&apos;ll receive a 6-digit code</li>
              <li>Enter the code below to link your account</li>
            </ol>
          </div>

          <form action={formAction} className="space-y-4">
            {state.errors?._form && (
              <Alert variant={state.success ? "default" : "destructive"}>
                <AlertDescription>{state.errors._form[0]}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="code">Linking Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  name="code"
                  placeholder="ABC123"
                  maxLength={6}
                  className="uppercase"
                  disabled={isPending}
                />
                <Button type="submit" disabled={isPending}>
                  <Link2 className="mr-2 h-4 w-4" />
                  {isPending ? "Linking..." : "Link"}
                </Button>
              </div>
              {state.errors?.code && (
                <p className="text-sm text-destructive">
                  {state.errors.code[0]}
                </p>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleUnlink}>
            <Unlink className="mr-2 h-4 w-4" />
            Unlink WhatsApp
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-5 w-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>
                Sync your reminders with Google Calendar for better
                organization.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Google Calendar integration is configured at the bot level. Your
            reminders will automatically appear in your connected Google
            Calendar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
