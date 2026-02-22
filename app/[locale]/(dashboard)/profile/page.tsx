import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";

function getStatusBadge(status: string, s: Record<string, string>) {
  const label = s[status] ?? status;
  switch (status) {
    case "ACTIVE":
      return <Badge variant="default">{label}</Badge>;
    case "TRIALING":
      return <Badge variant="secondary">{label}</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">{label}</Badge>;
    case "PAST_DUE":
      return <Badge variant="destructive">{label}</Badge>;
    case "PAUSED":
      return <Badge variant="outline">{label}</Badge>;
    default:
      return <Badge variant="outline">{label}</Badge>;
  }
}

function getDaysRemaining(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [dict, session] = await Promise.all([
    getDictionary(locale),
    auth(),
  ]);

  const [user, subscription] = await Promise.all([
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            chatId: true,
            createdAt: true,
          },
        })
      : null,
    session?.user?.id
      ? prisma.subscription.findUnique({
          where: { userId: session.user.id },
          select: {
            status: true,
            currentPeriodEnd: true,
            trialEndsAt: true,
            plan: {
              select: {
                name: true,
                description: true,
                features: true,
              },
            },
          },
        })
      : null,
  ]);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const features = Array.isArray(subscription?.plan.features)
    ? (subscription.plan.features as string[])
    : [];

  const endDate =
    subscription?.status === "TRIALING" && subscription.trialEndsAt
      ? subscription.trialEndsAt
      : subscription?.currentPeriodEnd ?? null;

  const daysRemaining = endDate ? getDaysRemaining(endDate) : null;

  const p = dict.settings.profile;
  const plan = dict.settings.plan;
  const ca = dict.settings.connectedAccounts;
  const btn = dict.settings.buttons;

  const statusLabels: Record<string, string> = {
    ACTIVE: plan.active,
    TRIALING: plan.trial,
    CANCELLED: plan.cancelled,
    PAST_DUE: plan.pastDue,
    PAUSED: plan.paused,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{dict.profile.title}</h2>
        <p className="text-muted-foreground">{dict.profile.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{p.title}</CardTitle>
          <CardDescription>{p.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{p.name}</Label>
              <Input id="name" defaultValue={user?.name || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{p.email}</Label>
              <Input id="email" defaultValue={user?.email || ""} disabled />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {p.memberSince}{" "}
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(locale) : "N/A"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {plan.title}
            {subscription && getStatusBadge(subscription.status, statusLabels)}
          </CardTitle>
          <CardDescription>
            {subscription
              ? subscription.plan.description ||
                plan.onPlan.replace("{plan}", subscription.plan.name)
              : plan.noActivePlan}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{subscription.plan.name}</span>
                {daysRemaining !== null && (
                  <span className="text-sm text-muted-foreground">
                    {daysRemaining}{" "}
                    {daysRemaining === 1 ? plan.dayRemaining : plan.daysRemaining}
                  </span>
                )}
              </div>
              {features.length > 0 && (
                <ul className="space-y-2">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <svg
                        className="h-4 w-4 text-green-500 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{plan.noPlanDescription}</p>
          )}
        </CardContent>
        <CardFooter>
          {subscription ? (
            <Link href={`/${locale}/subscription`}>
              <Button variant="outline" size="sm">
                {btn.manageSubscription}
              </Button>
            </Link>
          ) : (
            <Link href={`/${locale}/subscription/plans`}>
              <Button size="sm">{btn.viewPlans}</Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{ca.title}</CardTitle>
          <CardDescription>{ca.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">{ca.whatsApp}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.chatId
                    ? `${ca.connected}: ${user.chatId}`
                    : ca.notConnected}
                </p>
              </div>
            </div>
            <Link href={`/${locale}/settings/connections`}>
              <Button variant="outline" size="sm">
                {user?.chatId ? ca.manage : ca.connect}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
