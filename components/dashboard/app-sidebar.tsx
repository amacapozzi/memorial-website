"use client";

import * as React from "react";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  SmartHomeIcon,
  AppsIcon,
  SettingsIcon,
  SubscriptionIcon,
  type IconProps,
} from "@/components/icons";

import { SearchForm } from "@/components/dashboard/search";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserSidebar } from "./user-sidebar";

type Dictionary = {
  sidebar: {
    search: string;
    categories: {
      main: string;
      other: string;
    };
    reminders: {
      title: string;
      all: string;
      scheduled: string;
      history: string;
    };
    connections: {
      title: string;
      whatsapp: string;
      email: string;
      integrations: string;
    };
    settings: string;
    subscription: string;
    admin: {
      title: string;
      dashboard: string;
      users: string;
      plans: string;
      commits: string;
    };
  };
  user: {
    profile: string;
    billing: string;
    settings: string;
    logout: string;
  };
};

type NavItem = {
  title: string;
  url?: string;
  icon: React.ComponentType<IconProps>;
  defaultOpen?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

function getMainNavItems(dict: Dictionary["sidebar"]): NavItem[] {
  return [
    {
      title: dict.reminders.title,
      icon: SmartHomeIcon,
      defaultOpen: true,
      items: [
        { title: dict.reminders.all, url: "/reminders" },
        { title: dict.reminders.scheduled, url: "/reminders?view=schedule" },
        { title: dict.reminders.history, url: "/reminders/history" },
      ],
    },
  ];
}

function getConnectionsNavItems(dict: Dictionary["sidebar"]): NavItem[] {
  return [
    {
      title: dict.connections.title,
      icon: AppsIcon,
      defaultOpen: false,
      items: [{ title: dict.connections.integrations, url: "/integrations" }],
    },
  ];
}

function getOtherNavItems(dict: Dictionary["sidebar"]): NavItem[] {
  return [
    {
      title: dict.subscription,
      url: "/subscription",
      icon: SubscriptionIcon,
    },
    {
      title: dict.settings,
      url: "/settings",
      icon: SettingsIcon,
    },
  ];
}

function getAdminNavItems(dict: Dictionary["sidebar"]): NavItem[] {
  return [
    {
      title: dict.admin.title,
      icon: SmartHomeIcon,
      defaultOpen: true,
      items: [
        { title: dict.admin.dashboard, url: "/admin" },
        { title: dict.admin.users, url: "/admin/users" },
        { title: dict.admin.plans, url: "/admin/plans" },
        { title: dict.admin.commits, url: "/admin/commits" },
      ],
    },
  ];
}

function isPathActive(pathname: string, itemUrl: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");
  return pathWithoutLocale === itemUrl;
}

function isSectionActive(pathname: string, items: { url: string }[]): boolean {
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/)/, "");
  return items.some((item) => pathWithoutLocale.startsWith(item.url));
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  dictionary: Dictionary;
}

export function AppSidebar({ dictionary, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const mainNavItems = getMainNavItems(dictionary.sidebar);
  const connectionsNavItems = getConnectionsNavItems(dictionary.sidebar);
  const otherNavItems = getOtherNavItems(dictionary.sidebar);
  const adminNavItems = getAdminNavItems(dictionary.sidebar);

  const renderNavItem = (item: NavItem) => {
    const isActive = item.items
      ? isSectionActive(pathname, item.items)
      : isPathActive(pathname, item.url!);

    const inactiveClasses =
      "text-[#737373] hover:text-[#a3a3a3] transition-colors";
    const activeClasses = "text-[#e5e5e5]";

    return item.items ? (
      <Collapsible
        key={item.title}
        defaultOpen={item.defaultOpen || isActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              className={isActive ? activeClasses : inactiveClasses}
            >
              <item.icon size={20} />
              {item.title}
              <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="border-l border-white/[0.06] pl-3 ml-4">
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isPathActive(pathname, subItem.url)}
                    className={[
                      "h-9 max-w-[220px]",
                      "px-4",
                      "rounded-[10px]",
                      "text-[13px]",
                      "text-[#737373]",
                      "bg-transparent",
                      "shadow-none",
                      "hover:text-[#d4d4d4]",
                      "hover:bg-white/[0.03]",
                      "transition-all",
                      "data-[active=true]:bg-gradient-to-b",
                      "data-[active=true]:from-white/[0.12]",
                      "data-[active=true]:to-white/[0.04]",
                      "data-[active=true]:text-white",
                      "data-[active=true]:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.3)]",
                    ].join(" ")}
                  >
                    <Link href={subItem.url}>{subItem.title}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    ) : (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={isActive}
          className={isActive ? activeClasses : inactiveClasses}
        >
          <Link href={item.url!}>
            <item.icon size={20} />
            {item.title}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className="font-sans" {...props}>
      <SidebarHeader>
        <div className="flex justify-end px-2 pt-2 md:hidden">
          <SidebarTrigger className="text-[#737373] hover:text-white" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem className="px-3 my-1">
            <SidebarMenuButton size="lg" asChild>
              <UserSidebar dictionary={dictionary.user} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchForm placeholder={dictionary.sidebar.search} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainNavItems.map(renderNavItem)}
            {connectionsNavItems.map(renderNavItem)}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-6 bg-white/[0.06] data-[orientation=horizontal]:w-auto" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[#525252] text-xs font-normal tracking-wide">
            {dictionary.sidebar.categories.other}
          </SidebarGroupLabel>
          <SidebarMenu>{otherNavItems.map(renderNavItem)}</SidebarMenu>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator className="mx-6 bg-white/[0.06] data-[orientation=horizontal]:w-auto" />
            <SidebarGroup>
              <SidebarGroupLabel className="text-[#525252] text-xs font-normal tracking-wide">
                {dictionary.sidebar.admin.title}
              </SidebarGroupLabel>
              <SidebarMenu>{adminNavItems.map(renderNavItem)}</SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
