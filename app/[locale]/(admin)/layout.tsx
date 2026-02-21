import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getReminders } from "@/actions/reminders";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [session, { locale }] = await Promise.all([auth(), params]);

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}/reminders`);
  }

  const [dictionary, remindersData] = await Promise.all([
    getDictionary(locale as Locale),
    getReminders({ limit: 30 }),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar dictionary={dictionary} reminders={remindersData.reminders} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb locale={locale} />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
