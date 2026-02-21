import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
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

  const dictionary = await getDictionary(locale as Locale);

  return (
    <SidebarProvider>
      <AppSidebar dictionary={dictionary} />
      <SidebarInset className="bg-background overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <Breadcrumb locale={locale} />
        </header>

        <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-background p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
