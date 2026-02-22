import React from "react";
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
import { Locale } from "@/i18n/config";
import { DictionaryProvider } from "@/components/dictionary-provider";

export default async function DashboardLayout({
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

  const [dictionary, remindersData] = await Promise.all([
    getDictionary(locale as Locale),
    getReminders({ limit: 30 }),
  ]);

  return (
    <SidebarProvider>
      <AppSidebar
          dictionary={dictionary}
          reminders={remindersData.reminders}
          isAdmin={session.user.role === "ADMIN"}
        />
      <SidebarInset className="bg-background overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <Breadcrumb locale={locale} />
        </header>

        <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-background p-6">
          <DictionaryProvider dictionary={dictionary}>
            {children}
          </DictionaryProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
