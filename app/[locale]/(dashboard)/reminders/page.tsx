import { getReminders, getRemindersForMonth } from "@/actions/reminders";
import {
  ReminderList,
  MonthCalendarView,
  CalendarPickerButton,
} from "@/components/reminders";
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
  "h-[34px] rounded-md px-3 sm:px-4",
  "text-xs sm:text-[14px] leading-none",
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
  "w-max px-1 py-5.5",
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
    month?: string;
  }>;
}) {
  const params = await searchParams;
  const isScheduleView =
    (!params.view && !params.status) || params.view === "schedule";

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
  const monthFromToday = today.slice(0, 7);
  const monthFromDateParam =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date.slice(0, 7)
      : null;
  const monthStr =
    params.month && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : monthFromDateParam || monthFromToday;

  const fallbackDate = monthStr === monthFromToday ? today : `${monthStr}-01`;
  const dateParam =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : fallbackDate;
  const dateStr =
    dateParam.slice(0, 7) === monthStr ? dateParam : `${monthStr}-01`;

  const [listData, monthReminders] = await Promise.all([
    !isScheduleView
      ? getReminders({ status, page, limit: 12 })
      : Promise.resolve({ reminders: [], total: 0, totalPages: 0 }),
    isScheduleView ? getRemindersForMonth(monthStr) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 gap-6 font-sans">
      <div className="shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Reminders
        </h2>
        <p className="text-muted-foreground">
          View and manage all your scheduled reminders.
        </p>
      </div>

      <Tabs
        defaultValue={activeTab}
        className="flex flex-col flex-1 min-h-0 min-w-0 gap-4"
      >
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full overflow-x-auto pb-1 sm:pb-0">
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
          </div>
          <div className="w-full sm:ml-auto sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
            <CalendarPickerButton dateStr={dateStr} />
          </div>
        </div>

        {/* List views */}
        {!isScheduleView && (
          <TabsContent value={activeTab} className="space-y-4">
            <ReminderList reminders={listData.reminders} />
          </TabsContent>
        )}

        {/* Schedule / Calendar view */}
        {isScheduleView && (
          <TabsContent
            value="schedule"
            className="flex flex-col flex-1 min-h-0 min-w-0"
          >
            <MonthCalendarView
              reminders={monthReminders}
              monthStr={monthStr}
              selectedDateStr={dateStr}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
