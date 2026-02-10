"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SmartHomeIcon } from "../icons";

interface BreadcrumbProps {
  locale: string;
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  reminders: "Reminders",
  new: "Create",
  calendar: "Calendar",
  settings: "Settings",
  subscription: "Subscription",
  automation: "Automation",
  email: "Email",
  whatsapp: "WhatsApp",
  recurring: "Recurring",
};

export function Breadcrumb({ locale }: BreadcrumbProps) {
  const pathname = usePathname();

  // Remove locale from pathname
  const pathWithoutLocale = pathname.replace(`/${locale}`, "");
  const segments = pathWithoutLocale.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${locale}/${segments.slice(0, index + 1).join("/")}`;
    const label =
      routeLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm font-sans">
      <Link
        href={`/${locale}/reminders`}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <SmartHomeIcon size={22} />
      </Link>

      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-zinc-600" />
          {crumb.isLast ? (
            <span className="px-3 py-1.5 rounded-md font-medium  bg-zinc-800 text-white">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
