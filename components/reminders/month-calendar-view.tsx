"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReminderWithUser } from "@/actions/reminders";
import { TimelineDetailDialog } from "./timeline/timeline-detail-dialog";

type EventColor = "red" | "blue" | "green" | "purple" | "yellow" | "default";

type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  color: EventColor;
  dot?: boolean;
};

type CalendarDay = {
  day: number;
  iso: string;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  moreCount?: number;
};

const dayNames = ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

const eventColorClasses: Record<EventColor, string> = {
  red: "border border-[#75201b] bg-gradient-to-r from-[#4a1511]/95 to-[#602019]/90 text-[#ff7b70]",
  blue: "border border-[#1a477b] bg-gradient-to-r from-[#102f5d]/95 to-[#184179]/90 text-[#6cb3ff]",
  green:
    "border border-[#1c6440] bg-gradient-to-r from-[#0f3f2a]/95 to-[#165238]/90 text-[#4de39f]",
  purple:
    "border border-[#553585] bg-gradient-to-r from-[#31214f]/95 to-[#452b71]/90 text-[#c39eff]",
  yellow:
    "border border-[#7b4f19] bg-gradient-to-r from-[#4a2f0d]/95 to-[#6a4312]/90 text-[#ffbf66]",
  default:
    "border border-white/12 bg-gradient-to-r from-white/[0.10] to-white/[0.05] text-white/72",
};

const dotColorClasses: Record<EventColor, string> = {
  red: "bg-[#ff6d63]",
  blue: "bg-[#57a5ff]",
  green: "bg-[#39d98a]",
  purple: "bg-[#b893ff]",
  yellow: "bg-[#f5cc63]",
  default: "bg-white/65",
};

function toDateKey(value: Date | string): string {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthLabel(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });
}

function monthRangeLabel(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const startLabel = start.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endLabel = end.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startLabel} - ${endLabel}`;
}

function shiftMonth(monthStr: string, amount: number): string {
  const [year, month] = monthStr.split("-").map(Number);
  const d = new Date(year, month - 1 + amount, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function truncate(text: string, max = 11): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

function toEventTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getEventColor(reminder: ReminderWithUser, index: number): EventColor {
  if (reminder.status === "FAILED") return "red";
  if (reminder.status === "SENT") {
    return index % 3 === 0 ? "green" : index % 2 === 0 ? "blue" : "yellow";
  }
  if (reminder.status === "CANCELLED") return "default";
  const pendingPalette: EventColor[] = [
    "default",
    "yellow",
    "purple",
    "red",
    "blue",
    "green",
    "yellow",
  ];
  const seed = stableHash(reminder.id) + index;
  return pendingPalette[seed % pendingPalette.length];
}

function buildWeeks(
  monthStr: string,
  reminders: ReminderWithUser[],
): CalendarDay[][] {
  const [year, month] = monthStr.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayMondayIndex = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((firstDayMondayIndex + daysInMonth) / 7) * 7;
  const gridStart = new Date(year, month - 1, 1 - firstDayMondayIndex);

  const remindersByDate = new Map<string, ReminderWithUser[]>();
  for (const reminder of reminders) {
    const key = toDateKey(reminder.scheduledAt);
    const list = remindersByDate.get(key);
    if (list) {
      list.push(reminder);
    } else {
      remindersByDate.set(key, [reminder]);
    }
  }

  const days: CalendarDay[] = Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const iso = toDateKey(date);
    const dayReminders = remindersByDate.get(iso) ?? [];
    const events: CalendarEvent[] = dayReminders.slice(0, 3).map((r, idx) => ({
      id: r.id,
      title: truncate(r.reminderText),
      time: toEventTime(r.scheduledAt),
      color: getEventColor(r, idx),
      dot: r.recurrence !== "NONE" && idx === 0,
    }));

    return {
      day: date.getDate(),
      iso,
      isCurrentMonth: date.getMonth() === month - 1,
      events,
      moreCount: dayReminders.length > 3 ? dayReminders.length - 3 : undefined,
    };
  });

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function MonthCalendarView({
  reminders,
  monthStr,
  selectedDateStr,
}: {
  reminders: ReminderWithUser[];
  monthStr: string;
  selectedDateStr: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedReminder, setSelectedReminder] =
    useState<ReminderWithUser | null>(null);

  const weeks = useMemo(
    () => buildWeeks(monthStr, reminders),
    [monthStr, reminders],
  );
  const remindersById = useMemo(() => {
    const map = new Map<string, ReminderWithUser>();
    for (const reminder of reminders) {
      map.set(reminder.id, reminder);
    }
    return map;
  }, [reminders]);

  const updateQuery = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("view", "schedule");
    for (const [key, value] of Object.entries(patch)) {
      next.set(key, value);
    }
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            {monthLabel(monthStr)}
          </h2>
          <p className="text-sm text-white/50">{monthRangeLabel(monthStr)}</p>
        </div>

        <div className="flex items-center gap-1 sm:ml-auto">
          <button
            type="button"
            className="rounded p-1.5 text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/75"
            onClick={() => {
              const nextMonth = shiftMonth(monthStr, -1);
              updateQuery({ month: nextMonth, date: `${nextMonth}-01` });
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-1.5 text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/75"
            onClick={() => {
              const nextMonth = shiftMonth(monthStr, 1);
              updateQuery({ month: nextMonth, date: `${nextMonth}-01` });
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[720px] overflow-hidden rounded-lg border border-white/12 bg-transparent">
          <div className="grid grid-cols-7 border-b border-white/10">
            {dayNames.map((name) => (
              <div
                key={name}
                className="border-r border-white/10 px-3 py-2.5 text-center text-xs font-medium text-white/55 last:border-r-0"
              >
                {name}
              </div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7 border-b border-white/10 last:border-b-0"
            >
              {week.map((day, di) => (
                <button
                  key={`${wi}-${di}`}
                  type="button"
                  onClick={() => updateQuery({ date: day.iso })}
                  className={[
                    "group min-h-[96px] sm:min-h-[120px] border-r border-white/10 px-1.5 sm:px-2 py-2 text-left align-top last:border-r-0",
                    "transition-[background-color,box-shadow] duration-200",
                    "hover:bg-white/[0.04] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
                    day.iso === selectedDateStr
                      ? "bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                      : "",
                    day.isCurrentMonth === false ? "opacity-40" : "",
                  ].join(" ")}
                >
                  <span className="text-sm font-medium text-white/55">
                    {day.day}
                  </span>

                  <div className="mt-1 space-y-1">
                    {day.events.map((event) => (
                      <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          const reminder = remindersById.get(event.id);
                          if (reminder) setSelectedReminder(reminder);
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" && e.key !== " ") return;
                          e.preventDefault();
                          e.stopPropagation();
                          const reminder = remindersById.get(event.id);
                          if (reminder) setSelectedReminder(reminder);
                        }}
                        className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs transition-all duration-200 group-hover:brightness-110 ${eventColorClasses[event.color]}`}
                      >
                        {event.dot && (
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColorClasses[event.color]}`}
                          />
                        )}
                        <span className="truncate font-medium">
                          {event.title}
                        </span>
                        <span className="ml-auto hidden shrink-0 text-[10px] opacity-80 sm:inline">
                          {event.time}
                        </span>
                      </div>
                    ))}

                    {day.moreCount && (
                      <span className="pl-1 text-xs text-white/45">
                        {day.moreCount} more...
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <TimelineDetailDialog
        reminder={selectedReminder}
        onClose={() => setSelectedReminder(null)}
      />
    </div>
  );
}
