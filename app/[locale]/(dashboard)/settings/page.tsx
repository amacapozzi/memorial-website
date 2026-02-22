import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PreferencesForm } from "@/components/settings";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale } from "@/i18n/config";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const [dict, session] = await Promise.all([
    getDictionary(locale),
    auth(),
  ]);

  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          digestEnabled: true,
          digestHour: true,
          briefEnabled: true,
        },
      })
    : null;

  const n = dict.settings.notifications;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{dict.settings.title}</h2>
        <p className="text-muted-foreground">{dict.settings.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{n.title}</CardTitle>
          <CardDescription>{n.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm
            briefEnabled={user?.briefEnabled ?? true}
            digestEnabled={user?.digestEnabled ?? true}
            digestHour={user?.digestHour ?? 8}
            strings={{
              morningBriefTitle: n.morningBrief.title,
              morningBriefDescription: n.morningBrief.description,
              dailyDigestTitle: n.dailyDigest.title,
              dailyDigestDescription: n.dailyDigest.description,
              digestHourTitle: n.digestHour.title,
              digestHourDescription: n.digestHour.description,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
