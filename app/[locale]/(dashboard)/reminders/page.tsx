import { getReminders, getRemindersForDate } from "@/actions/reminders";
import { ReminderList, TimelineView, CalendarPickerButton } from "@/components/reminders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const tabs = [
  { value: "schedule", href: "?", label: "Schedule" },
  { value: "all", href: "?view=all", label: "All" },
  { value: "PENDING", href: "?status=PENDING", label: "Pending" },
  { value: "SENT", href: "?status=SENT", label: "Sent" },
  { value: "FAILED", href: "?status=FAILED", label: "Failed" },
  { value: "CANCELLED", href: "?status=CANCELLED", label: "Cancelled" },
] as const;

const tabTriggerClass = [
  "h-[34px] rounded-md px-4",
  "text-[14px] leading-none",
  "transition-[color,background,box-shadow] duration-200",
  "focus-visible:outline-none focus-visible:ring-0",
  "text-white/35 hover:text-white/50",
  "bg-transparent shadow-none",
  "data-[state=active]:text-white",
  "data-[state=active]:bg-gradient-to-b",
  "data-[state=active]:from-white/[0.12]",
  "data-[state=active]:to-white/[0.05]",
  "data-[state=active]:shadow-[0_0_0_1px_rgba(255,255,255,0.09),inset_0_1px_0_rgba(255,255,255,0.16)]",
].join(" ");

const tabsListClass = [
  "relative inline-flex items-center gap-1",
  "w-fit px-1 py-5.5",
  "rounded-lg",
  "bg-white/[0.035] backdrop-blur-md",
  "shadow-[0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.60),0_16px_34px_rgba(0,0,0,0.45)]",
].join(" ");

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    page?: string;
    view?: string;
    date?: string;
  }>;
}) {
  const params = await searchParams;
  const isScheduleView = !params.view && !params.status || params.view === "schedule";

  const status = params.status as
    | "PENDING"
    | "SENT"
    | "FAILED"
    | "CANCELLED"
    | undefined;
  const page = params.page ? parseInt(params.page) : 1;

  // Determine active tab
  const activeTab = isScheduleView ? "schedule" : status || "all";

  // Fetch data based on view
  const today = new Date().toISOString().split("T")[0];
  const dateStr = params.date || today;

  const [listData, scheduleReminders] = await Promise.all([
    !isScheduleView
      ? getReminders({ status, page, limit: 12 })
      : Promise.resolve({ reminders: [], total: 0, totalPages: 0 }),
    isScheduleView ? getRemindersForDate(dateStr) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 gap-6 font-sans">
      <div className="shrink-0">
        <h2 className="text-2xl font-bold tracking-tight">Reminders</h2>
        <p className="text-muted-foreground">
          View and manage all your scheduled reminders.
        </p>
      </div>

      <Tabs
        defaultValue={activeTab}
        className="flex flex-col flex-1 min-h-0 min-w-0 gap-4"
      >
        <div className="flex items-center gap-3 shrink-0">
          <TabsList className={tabsListClass}>
            {tabs.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                asChild
                className={tabTriggerClass}
              >
                <Link href={t.href}>{t.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
          <CalendarPickerButton dateStr={dateStr} />
        </div>

        {/* List views */}
        {!isScheduleView && (
          <TabsContent value={activeTab} className="space-y-4">
            <ReminderList reminders={listData.reminders} />
          </TabsContent>
        )}

        {/* Schedule / Timeline view */}
        {isScheduleView && (
          <TabsContent
            value="schedule"
            className="flex flex-col flex-1 min-h-0 min-w-0"
          >
            <TimelineView reminders={scheduleReminders} dateStr={dateStr} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
