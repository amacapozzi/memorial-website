"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ReminderWithUser } from "@/actions/reminders";
import { TimelineCard } from "./timeline-card";

const HOUR_WIDTH = 200;
const TOTAL_WIDTH = 24 * HOUR_WIDTH;
const CARD_WIDTH = 180;
const CARD_HEIGHT = 90;
const CARD_GAP = 4;
const TOP_HEADER_HEIGHT = 40;

function getHourOffset(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

function assignLanes(reminders: ReminderWithUser[]): number[] {
  const lanes: number[] = new Array(reminders.length).fill(0);
  const laneEnds: number[] = [];

  for (let i = 0; i < reminders.length; i++) {
    const left = getHourOffset(new Date(reminders[i].scheduledAt)) * HOUR_WIDTH;
    const right = left + CARD_WIDTH;

    let placed = false;
    for (let l = 0; l < laneEnds.length; l++) {
      if (left >= laneEnds[l]) {
        lanes[i] = l;
        laneEnds[l] = right + CARD_GAP;
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes[i] = laneEnds.length;
      laneEnds.push(right + CARD_GAP);
    }
  }

  return lanes;
}

export function TimelineTrack({
  reminders,
  dateStr,
  onSelectReminder,
}: {
  reminders: ReminderWithUser[];
  dateStr: string;
  onSelectReminder: (r: ReminderWithUser) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);
  const [now, setNow] = useState(new Date());

  const isToday =
    new Date().toISOString().split("T")[0] === dateStr;

  // Update current time every 60s
  useEffect(() => {
    if (!isToday) return;
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, [isToday]);

  // Auto-scroll to current time (today) or 8 AM (other days)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const targetHour = isToday ? getHourOffset(new Date()) : 8;
    // Center the target hour in the viewport
    const scrollTo = targetHour * HOUR_WIDTH - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, scrollTo);
  }, [isToday, dateStr]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setCursorX(e.clientX - rect.left + e.currentTarget.scrollLeft);
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setCursorX(null);
  }, []);

  // Scroll horizontally with mouse wheel (needs native listener for non-passive)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const lanes = assignLanes(reminders);
  const maxLane = lanes.length > 0 ? Math.max(...lanes) : 0;
  const contentHeight =
    TOP_HEADER_HEIGHT + (maxLane + 1) * (CARD_HEIGHT + CARD_GAP) + 40;

  const nowOffset = isToday ? getHourOffset(now) * HOUR_WIDTH : null;

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={[
        "relative overflow-x-auto overflow-y-hidden",
        "flex-1 min-h-0 min-w-0 max-w-full",
        "rounded-xl",
        "bg-white/[0.035] backdrop-blur-md",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(0,0,0,0.60),0_16px_34px_rgba(0,0,0,0.45)]",
      ].join(" ")}
    >
      {/* Inner container for full scrollable width */}
      <div className="relative h-full" style={{ width: TOTAL_WIDTH, minHeight: Math.max(contentHeight, 220) }}>
        {/* Hour headers */}
        <div
          className="sticky top-0 z-20 flex"
          style={{ width: TOTAL_WIDTH }}
        >
          {hours.map((h) => (
            <div
              key={h}
              className="flex-shrink-0 border-r border-white/[0.04] bg-[#0d0d0d]/80 backdrop-blur-sm px-3 py-2.5 text-[11px] font-medium text-[#737373]"
              style={{ width: HOUR_WIDTH }}
            >
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Vertical grid lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-white/[0.04]"
            style={{ left: h * HOUR_WIDTH }}
          />
        ))}

        {/* Current time indicator */}
        {nowOffset !== null && (
          <>
            <div
              className="absolute z-10 top-0 bottom-0 w-px bg-blue-500/70"
              style={{ left: nowOffset }}
            />
            <div
              className="absolute z-20 rounded-full bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5"
              style={{
                left: nowOffset - 16,
                top: TOP_HEADER_HEIGHT + 4,
              }}
            >
              {now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </>
        )}

        {/* Cursor-following vertical line */}
        {cursorX !== null && (
          <div
            className="absolute top-0 bottom-0 w-px bg-white/20 pointer-events-none z-10"
            style={{ left: cursorX }}
          />
        )}

        {/* Reminder cards */}
        {reminders.map((r, i) => {
          const offset = getHourOffset(new Date(r.scheduledAt));
          const left = offset * HOUR_WIDTH;
          const top =
            TOP_HEADER_HEIGHT + lanes[i] * (CARD_HEIGHT + CARD_GAP) + 8;

          return (
            <TimelineCard
              key={r.id}
              reminder={r}
              style={{ left, top }}
              onClick={() => onSelectReminder(r)}
            />
          );
        })}

        {/* Empty state */}
        {reminders.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/30">
              No reminders scheduled for this day
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
