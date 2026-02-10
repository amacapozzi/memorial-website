"use client";

import type { ReminderWithUser } from "@/actions/reminders";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400",
  SENT: "bg-green-500/20 text-green-400",
  FAILED: "bg-red-500/20 text-red-400",
  CANCELLED: "bg-neutral-500/20 text-neutral-400",
};

export function TimelineCard({
  reminder,
  style,
  onClick,
}: {
  reminder: ReminderWithUser;
  style: React.CSSProperties;
  onClick: () => void;
}) {
  const time = new Date(reminder.scheduledAt);
  const timeStr = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={[
        "absolute w-[180px] rounded-lg p-3 text-left",
        "bg-white/[0.05] border border-white/[0.08]",
        "hover:bg-white/[0.08] hover:border-white/[0.12]",
        "backdrop-blur-sm transition-all duration-150",
        "cursor-pointer outline-none",
        "focus-visible:ring-2 focus-visible:ring-blue-500/50",
      ].join(" ")}
    >
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[reminder.status] || statusColors.PENDING}`}
      >
        {reminder.status}
      </span>
      <p className="mt-1.5 text-xs font-medium text-white/90 line-clamp-2 leading-relaxed">
        {reminder.reminderText}
      </p>
      <p className="mt-1 text-[10px] text-white/40">{timeStr}</p>
    </button>
  );
}
