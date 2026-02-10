"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReminderWithUser } from "@/actions/reminders";
import { Button } from "@/components/ui/button";
import { TimelineTrack } from "./timeline-track";
import { TimelineDetailDialog } from "./timeline-detail-dialog";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function TimelineView({
  reminders,
  dateStr,
}: {
  reminders: ReminderWithUser[];
  dateStr: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ReminderWithUser | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const isToday = dateStr === today;

  const navigateTo = useCallback(
    (d: string) => {
      router.push(`?view=schedule&date=${d}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 gap-4">
      {/* Day navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateTo(addDays(dateStr, -1))}
          className="border-white/[0.08] text-white/60 hover:bg-white/[0.05] h-9 w-9"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <h3 className="text-base font-medium text-white/80 min-w-[280px] text-center">
          {formatDateHeader(dateStr)}
          {isToday && (
            <span className="ml-2 text-xs text-blue-400 font-normal">
              Today
            </span>
          )}
        </h3>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateTo(addDays(dateStr, 1))}
          className="border-white/[0.08] text-white/60 hover:bg-white/[0.05] h-9 w-9"
        >
          <ChevronRight className="size-4" />
        </Button>

        {!isToday && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateTo(today)}
            className="border-white/[0.08] text-white/60 hover:bg-white/[0.05]"
          >
            Today
          </Button>
        )}

        <span className="text-xs text-white/30 ml-auto">
          {reminders.length} reminder{reminders.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline track */}
      <TimelineTrack
        reminders={reminders}
        dateStr={dateStr}
        onSelectReminder={setSelected}
      />

      {/* Detail dialog */}
      <TimelineDetailDialog
        reminder={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
